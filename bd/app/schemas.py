"""
Pydantic schemas for API request/response validation.
"""
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


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
