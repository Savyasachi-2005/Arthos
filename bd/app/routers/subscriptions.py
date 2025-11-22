"""Subscription management router."""
import logging
from typing import Optional, List

from fastapi import APIRouter, Depends, Query, status, Body
from sqlmodel import Session

from app.database import get_session
from app.models import BillingCycle, User
from app.schemas import (
    SubscriptionCreate,
    SubscriptionListResponse,
    SubscriptionResponse,
    SubscriptionSummaryResponse,
    SubscriptionUpdate,
)
from app.services import subscription_service
from app.routers.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


@router.post("", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription_endpoint(
    payload: SubscriptionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> SubscriptionResponse:
    """Create a subscription record."""
    logger.info("Creating subscription '%s' for user %s", payload.name, current_user.id)
    return subscription_service.create_subscription(payload, session, current_user.id)


@router.get("", response_model=SubscriptionListResponse)
async def list_subscriptions_endpoint(
    name: Optional[str] = Query(default=None, description="Filter by subscription name"),
    min_amount: Optional[float] = Query(default=None, ge=0, description="Minimum subscription amount"),
    max_amount: Optional[float] = Query(default=None, ge=0, description="Maximum subscription amount"),
    billing_cycle: Optional[BillingCycle] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> SubscriptionListResponse:
    """Fetch subscriptions with advanced filters."""
    filters = subscription_service.SubscriptionFilters(
        name=name,
        min_amount=min_amount,
        max_amount=max_amount,
        billing_cycle=billing_cycle,
    )
    return subscription_service.list_subscriptions(session, filters, limit, offset, current_user.id)


@router.put("/{subscription_id}", response_model=SubscriptionResponse)
async def update_subscription_endpoint(
    subscription_id: int,
    payload: SubscriptionUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> SubscriptionResponse:
    """Update a subscription record."""
    logger.info("Updating subscription id=%s for user %s", subscription_id, current_user.id)
    return subscription_service.update_subscription(subscription_id, payload, session, current_user.id)


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscription_endpoint(
    subscription_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> None:
    """Delete a subscription."""
    logger.info("Deleting subscription id=%s for user %s", subscription_id, current_user.id)
    subscription_service.delete_subscription(subscription_id, session, current_user.id)


@router.get("/summary", response_model=SubscriptionSummaryResponse)
async def get_subscription_summary(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> SubscriptionSummaryResponse:
    """Return aggregated subscription burn-rate summary."""
    logger.info("Fetching subscription summary for user %s", current_user.id)
    return subscription_service.get_summary(session, current_user.id)


@router.post("/batch", response_model=List[SubscriptionResponse], status_code=status.HTTP_201_CREATED)
async def create_subscriptions_batch(
    subscriptions: List[SubscriptionCreate] = Body(..., description="List of subscriptions to create"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> List[SubscriptionResponse]:
    """Create multiple subscriptions at once (for auto-detected subscriptions)."""
    logger.info(f"Creating {len(subscriptions)} subscriptions in batch for user {current_user.id}")
    
    created_subscriptions = []
    for sub_data in subscriptions:
        try:
            created_sub = subscription_service.create_subscription(sub_data, session, current_user.id)
            created_subscriptions.append(created_sub)
        except Exception as e:
            logger.error(f"Failed to create subscription {sub_data.name}: {str(e)}")
            # Continue with other subscriptions
            continue
    
    logger.info(f"Successfully created {len(created_subscriptions)} out of {len(subscriptions)} subscriptions")
    return created_subscriptions
