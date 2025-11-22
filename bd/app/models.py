"""
SQLModel models for the UPI Spend Analyzer.
Defines the Transaction model for persisting parsed transactions.
"""
from datetime import datetime, date
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Relationship


class User(SQLModel, table=True):
    """User authentication and profile model."""
    __tablename__ = "users"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    username: str = Field(unique=True, index=True, min_length=3, max_length=50)
    hashed_password: str = Field(max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=100)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BillingCycle(str, Enum):
    """Billing cycle enum for subscriptions."""
    monthly = "monthly"
    quarterly = "quarterly"
    yearly = "yearly"


class Transaction(SQLModel, table=True):
    """
    Transaction model representing a parsed UPI/bank transaction.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User
        raw_text: Original SMS/message text
        merchant: Extracted merchant name (if available)
        amount: Transaction amount in INR
        category: Assigned category (Food, Travel, Bills, etc.)
        timestamp: Parsed transaction date/time (nullable)
        created_at: Record creation timestamp
    """
    __tablename__ = "transactions"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    raw_text: str = Field(index=True)
    merchant: Optional[str] = Field(default=None, index=True)
    amount: float = Field(gt=0)  # Must be positive
    category: str = Field(default="Others", index=True)
    timestamp: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Subscription(SQLModel, table=True):
    """Recurring subscription entity."""
    __tablename__ = "subscriptions"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    name: str = Field(index=True, min_length=1, max_length=120)
    amount: float = Field(gt=0)
    billing_cycle: BillingCycle = Field(default=BillingCycle.monthly)
    renewal_date: date = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class BankAnalysis(SQLModel, table=True):
    """
    Bank statement analysis record.
    Stores analyzed bank statements with AI-generated insights.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User
        raw_text: Original bank statement text
        total_spend: Total debit amount
        total_income: Total credit amount
        transaction_count: Number of transactions found
        top_category: Category with highest spending
        top_merchant: Merchant with highest spending
        analysis_json: Full Gemini AI analysis as JSON string
        created_at: Analysis timestamp
    """
    __tablename__ = "bank_analyses"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    raw_text: str = Field(index=False)  # Full statement text
    total_spend: float = Field(default=0.0)
    total_income: float = Field(default=0.0)
    transaction_count: int = Field(default=0)
    top_category: str = Field(default="Unknown")
    top_merchant: str = Field(default="Unknown")
    analysis_json: str = Field(default="{}")  # Store full analysis as JSON
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

