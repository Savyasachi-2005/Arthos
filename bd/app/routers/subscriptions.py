"""Subscription management router."""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.database import get_session
from app.models import BillingCycle
from app.schemas import (
    SubscriptionCreate,
    SubscriptionListResponse,
    SubscriptionResponse,
    SubscriptionSummaryResponse,
    SubscriptionUpdate,
)
from app.services import subscription_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


@router.post("", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription_endpoint(
    payload: SubscriptionCreate,
    session: Session = Depends(get_session),
) -> SubscriptionResponse:
    """Create a subscription record."""
    logger.info("Creating subscription '%s'", payload.name)
    return subscription_service.create_subscription(payload, session)


@router.get("", response_model=SubscriptionListResponse)
async def list_subscriptions_endpoint(
    name: Optional[str] = Query(default=None, description="Filter by subscription name"),
    min_amount: Optional[float] = Query(default=None, ge=0, description="Minimum subscription amount"),
    max_amount: Optional[float] = Query(default=None, ge=0, description="Maximum subscription amount"),
    billing_cycle: Optional[BillingCycle] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
) -> SubscriptionListResponse:
    """Fetch subscriptions with advanced filters."""
    filters = subscription_service.SubscriptionFilters(
        name=name,
        min_amount=min_amount,
        max_amount=max_amount,
        billing_cycle=billing_cycle,
    )
    return subscription_service.list_subscriptions(session, filters, limit, offset)


@router.put("/{subscription_id}", response_model=SubscriptionResponse)
async def update_subscription_endpoint(
    subscription_id: int,
    payload: SubscriptionUpdate,
    session: Session = Depends(get_session),
) -> SubscriptionResponse:
    """Update a subscription record."""
    logger.info("Updating subscription id=%s", subscription_id)
    return subscription_service.update_subscription(subscription_id, payload, session)


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscription_endpoint(
    subscription_id: int,
    session: Session = Depends(get_session),
) -> None:
    """Delete a subscription."""
    logger.info("Deleting subscription id=%s", subscription_id)
    subscription_service.delete_subscription(subscription_id, session)


@router.get("/summary", response_model=SubscriptionSummaryResponse)
async def get_subscription_summary(
    session: Session = Depends(get_session),
) -> SubscriptionSummaryResponse:
    """Return aggregated subscription burn-rate summary."""
    logger.info("Fetching subscription summary")
    return subscription_service.get_summary(session)
