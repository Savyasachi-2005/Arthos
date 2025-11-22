"""Business logic for subscription management and burn-rate tracking."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlmodel import Session, select

from app.models import BillingCycle, Subscription
from app.schemas import (
    SubscriptionCreate,
    SubscriptionListResponse,
    SubscriptionResponse,
    SubscriptionSummaryResponse,
    SubscriptionUpdate,
    UpcomingRenewal,
)

UPCOMING_RENEWAL_WINDOW_DAYS = 7


@dataclass
class SubscriptionFilters:
    """Query filters for subscriptions."""
    name: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    billing_cycle: Optional[BillingCycle] = None


def create_subscription(payload: SubscriptionCreate, session: Session, user_id: UUID) -> SubscriptionResponse:
    """Persist a new subscription and return the response model."""
    subscription = Subscription(**payload.model_dump(), user_id=user_id)
    session.add(subscription)
    session.commit()
    session.refresh(subscription)
    return _to_response(subscription)


def list_subscriptions(
    session: Session,
    filters: SubscriptionFilters,
    limit: int,
    offset: int,
    user_id: UUID
) -> SubscriptionListResponse:
    """Return paginated subscriptions with applied filters for a specific user."""
    query = _apply_filters(select(Subscription).where(Subscription.user_id == user_id), filters)
    query = query.order_by(Subscription.created_at.desc()).offset(offset).limit(limit)
    items = session.exec(query).all()

    count_query = _apply_filters(
        select(func.count()).select_from(Subscription).where(Subscription.user_id == user_id), 
        filters
    )
    total = session.exec(count_query).one()

    responses = [_to_response(item) for item in items]
    return SubscriptionListResponse(items=responses, total=total, limit=limit, offset=offset)


def update_subscription(
    subscription_id: int,
    payload: SubscriptionUpdate,
    session: Session,
    user_id: UUID
) -> SubscriptionResponse:
    """Update an existing subscription."""
    subscription = _get_subscription_or_404(subscription_id, session, user_id)
    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(subscription, key, value)

    session.add(subscription)
    session.commit()
    session.refresh(subscription)
    return _to_response(subscription)


def delete_subscription(subscription_id: int, session: Session, user_id: UUID) -> None:
    """Delete a subscription and handle missing records."""
    subscription = _get_subscription_or_404(subscription_id, session, user_id)
    session.delete(subscription)
    session.commit()


def get_summary(session: Session, user_id: UUID) -> SubscriptionSummaryResponse:
    """Compute monthly/yearly burn and upcoming renewals for a specific user."""
    subscriptions = session.exec(
        select(Subscription).where(Subscription.user_id == user_id)
    ).all()

    monthly_burn = sum(_calculate_monthly_equivalent(sub) for sub in subscriptions)
    yearly_burn = monthly_burn * 12

    today = date.today()

    upcoming: List[UpcomingRenewal] = []
    for subscription in subscriptions:
        days_left = (subscription.renewal_date - today).days
        if 0 <= days_left <= UPCOMING_RENEWAL_WINDOW_DAYS:
            upcoming.append(
                UpcomingRenewal(
                    name=subscription.name,
                    days_left=days_left,
                    renewal_date=subscription.renewal_date,
                )
            )

    return SubscriptionSummaryResponse(
        monthly_burn=round(monthly_burn, 2),
        yearly_burn=round(yearly_burn, 2),
        upcoming_renewals=sorted(upcoming, key=lambda item: item.days_left),
    )


def _calculate_monthly_equivalent(subscription: Subscription) -> float:
    """Convert subscription amount to its monthly equivalent."""
    if subscription.billing_cycle == BillingCycle.yearly:
        return subscription.amount / 12
    return subscription.amount


def _to_response(subscription: Subscription) -> SubscriptionResponse:
    """Map SQLModel entity to API schema."""
    monthly_equivalent = _calculate_monthly_equivalent(subscription)
    response = SubscriptionResponse.model_validate(
        subscription,
        from_attributes=True,
    )
    return response.model_copy(update={"monthly_equivalent": round(monthly_equivalent, 2)})


def _get_subscription_or_404(subscription_id: int, session: Session, user_id: UUID) -> Subscription:
    subscription = session.get(Subscription, subscription_id)
    if not subscription or subscription.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription with id {subscription_id} not found",
        )
    return subscription


def _apply_filters(statement, filters: SubscriptionFilters):
    """Apply query filters to a SQLModel select statement."""
    if filters.name:
        lowered = filters.name.lower()
        statement = statement.where(func.lower(Subscription.name).contains(lowered))

    if filters.min_amount is not None:
        statement = statement.where(Subscription.amount >= filters.min_amount)

    if filters.max_amount is not None:
        statement = statement.where(Subscription.amount <= filters.max_amount)

    if filters.billing_cycle:
        statement = statement.where(Subscription.billing_cycle == filters.billing_cycle)

    return statement