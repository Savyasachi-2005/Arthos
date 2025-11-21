"""
SQLModel models for the UPI Spend Analyzer.
Defines the Transaction model for persisting parsed transactions.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Transaction(SQLModel, table=True):
    """
    Transaction model representing a parsed UPI/bank transaction.
    
    Attributes:
        id: Unique identifier (UUID)
        raw_text: Original SMS/message text
        merchant: Extracted merchant name (if available)
        amount: Transaction amount in INR
        category: Assigned category (Food, Travel, Bills, etc.)
        timestamp: Parsed transaction date/time (nullable)
        created_at: Record creation timestamp
    """
    __tablename__ = "transactions"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    raw_text: str = Field(index=True)
    merchant: Optional[str] = Field(default=None, index=True)
    amount: float = Field(gt=0)  # Must be positive
    category: str = Field(default="Others", index=True)
    timestamp: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
