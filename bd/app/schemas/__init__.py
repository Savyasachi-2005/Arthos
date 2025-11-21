"""
Pydantic schemas for API request/response validation.
"""
from datetime import date, datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, PositiveFloat

from app.models import BillingCycle


class UPIAnalyzeRequest(BaseModel):
    """Request schema for analyzing UPI/SMS messages."""
    raw_text: str = Field(..., description="Raw SMS/bank message text, can contain multiple lines")


class TransactionOut(BaseModel):
    """Response schema for a single transaction."""
    id: UUID
    merchant: Optional[str]
    amount: float
    category: str
    timestamp: Optional[datetime]
    raw_text: str
    
    class Config:
        from_attributes = True


class TopMerchant(BaseModel):
    """Top merchant information."""
    merchant: str
    total_spent: float
    count: int


class SummaryData(BaseModel):
    """Summary statistics for analyzed transactions."""
    total_spend: float = Field(..., description="Total amount spent")
    transaction_count: int = Field(..., description="Number of transactions")
    top_category: Optional[str] = Field(None, description="Category with highest spend")
    categories: Dict[str, float] = Field(default_factory=dict, description="Category-wise spending breakdown")
    top_merchants: List[TopMerchant] = Field(default_factory=list, description="Top merchants by spending")


class AnalyzeResponse(BaseModel):
    """Complete response for /upi/analyze endpoint."""
    summary: SummaryData
    categories: Dict[str, float] = Field(..., description="Category-wise spending breakdown")
    transactions: List[TransactionOut]


class TransactionListResponse(BaseModel):
    """Response schema for listing transactions."""
    transactions: List[TransactionOut]
    total: int
    limit: int
    offset: int
    summary: SummaryData


class HealthResponse(BaseModel):
    """Health check response."""
    status: str

class SubscriptionBase(BaseModel):
    """Shared subscription fields."""
    name: str = Field(..., min_length=1, max_length=120)
    amount: PositiveFloat = Field(..., description="Subscription charge amount in INR")
    billing_cycle: BillingCycle
    renewal_date: date

class SubscriptionCreate(SubscriptionBase):
    """Payload for creating a subscription."""
    pass

class SubscriptionUpdate(BaseModel):
    """Payload for updating a subscription."""
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    amount: Optional[PositiveFloat] = Field(None, description="Subscription charge amount in INR")
    billing_cycle: Optional[BillingCycle] = None
    renewal_date: Optional[date] = None

class SubscriptionResponse(SubscriptionBase):
    """Subscription with metadata."""
    id: int
    created_at: datetime
    monthly_equivalent: float = Field(0.0, description="Monthly normalized spend for this subscription")

    class Config:
        from_attributes = True

class UpcomingRenewal(BaseModel):
    """Upcoming renewal details."""
    name: str
    days_left: int
    renewal_date: date

class SubscriptionSummaryResponse(BaseModel):
    """Aggregate burn-rate summary."""
    monthly_burn: float
    yearly_burn: float
    upcoming_renewals: List[UpcomingRenewal] = Field(default_factory=list)

class SubscriptionListResponse(BaseModel):
    """Paginated subscriptions response."""
    items: List[SubscriptionResponse]
    total: int
    limit: int
    offset: int
