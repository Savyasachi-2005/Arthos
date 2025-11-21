"""
Pydantic schemas for Bank Statement Analysis API.
"""
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class StatementUploadRequest(BaseModel):
    """Request for uploading statement as raw text."""
    raw_text: str = Field(..., description="Raw text content of bank statement")


class StatementUploadResponse(BaseModel):
    """Response after uploading and extracting statement."""
    raw_text: str = Field(..., description="Full extracted text")
    lines: List[str] = Field(..., description="Transaction lines extracted")
    line_count: int = Field(..., description="Number of lines extracted")


class BankTransaction(BaseModel):
    """Individual bank transaction from statement."""
    date: Optional[str] = Field(None, description="Transaction date")
    merchant: str = Field(..., description="Merchant/payee name")
    amount: float = Field(..., description="Transaction amount")
    category: str = Field(..., description="Spending category")
    type: str = Field(..., description="Transaction type: debit/credit")


class MonthlySummary(BaseModel):
    """Monthly spending summary."""
    month: str = Field(..., description="Month name or YYYY-MM")
    total: float = Field(..., description="Total spend for the month")


class AnalysisSummary(BaseModel):
    """High-level summary of bank statement analysis."""
    total_spend: float = Field(..., description="Total spending amount")
    total_income: float = Field(0.0, description="Total income/credits")
    top_category: str = Field(..., description="Category with highest spending")
    top_merchant: str = Field(..., description="Merchant with highest spending")
    wasteful_spending: List[str] = Field(default_factory=list, description="Wasteful spending categories/merchants")
    monthly_summary: Dict[str, float] = Field(default_factory=dict, description="Month-wise spending breakdown")
    category_breakdown: Dict[str, float] = Field(default_factory=dict, description="Category-wise spending")


class AnalyzeStatementRequest(BaseModel):
    """Request for analyzing bank statement with Gemini AI."""
    raw_text: str = Field(..., description="Raw bank statement text to analyze")


class AnalyzeStatementResponse(BaseModel):
    """Complete analysis response from Gemini AI."""
    summary: AnalysisSummary
    transactions: List[BankTransaction] = Field(default_factory=list, description="All extracted transactions")
    anomalies: List[str] = Field(default_factory=list, description="Detected anomalies and irregular transactions")
    recommendations: List[str] = Field(default_factory=list, description="AI-generated financial recommendations")
    subscriptions_detected: List[str] = Field(default_factory=list, description="Detected recurring subscriptions")
    duplicate_charges: List[str] = Field(default_factory=list, description="Duplicate or repeated charges")


class BankAnalysisHistoryItem(BaseModel):
    """Single bank analysis history record."""
    id: UUID
    timestamp: datetime
    raw_text_preview: str = Field(..., description="First 200 chars of statement")
    total_spend: float
    transaction_count: int
    top_category: str
    
    class Config:
        from_attributes = True


class BankAnalysisHistoryResponse(BaseModel):
    """List of previous bank statement analyses."""
    analyses: List[BankAnalysisHistoryItem]
    total: int


class DownloadReportRequest(BaseModel):
    """Request for downloading PDF report with pre-analyzed data."""
    raw_text: str = Field(..., description="Raw bank statement text")
    analysis_data: AnalyzeStatementResponse = Field(..., description="Already analyzed data from Gemini")
