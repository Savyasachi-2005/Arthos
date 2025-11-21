"""
UPI transaction analysis router.
Provides endpoints for parsing and analyzing UPI/SMS messages.
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models import Transaction
from app.schemas import (
    AnalyzeResponse,
    SummaryData,
    TransactionListResponse,
    TransactionOut,
    UPIAnalyzeRequest,
)
from app.services.category_mapper import map_category
from app.services.summary_builder import (
    build_summary,
    get_top_merchants,
    build_category_breakdown
)
from app.services.upi_parser import parse_messages

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/upi", tags=["UPI Analysis"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_upi_messages(
    request: UPIAnalyzeRequest,
    session: Session = Depends(get_session)
) -> AnalyzeResponse:
    """
    Parse and analyze UPI/SMS messages, extract transactions, and persist to database.
    
    Args:
        request: Contains raw_text with one or more SMS lines
        session: Database session
        
    Returns:
        AnalyzeResponse with summary, categories, and transactions
    """
    try:
        # Parse messages to extract transactions
        parsed_transactions = parse_messages(request.raw_text)
        
        if not parsed_transactions:
            logger.info("No valid transactions found in input text")
            return AnalyzeResponse(
                summary=SummaryData(
                    total_spend=0.0,
                    transaction_count=0,
                    top_category=None
                ),
                categories={},
                transactions=[]
            )
        
        # Create Transaction models and persist to DB
        db_transactions: List[Transaction] = []
        
        for parsed in parsed_transactions:
            # Map category
            category = map_category(parsed.raw_text, parsed.merchant)
            
            # Create model instance
            transaction = Transaction(
                raw_text=parsed.raw_text,
                merchant=parsed.merchant,
                amount=parsed.amount,
                category=category,
                timestamp=parsed.timestamp
            )
            
            # Add to session
            session.add(transaction)
            db_transactions.append(transaction)
        
        # Commit all transactions
        session.commit()
        
        # Refresh to get generated IDs
        for transaction in db_transactions:
            session.refresh(transaction)
        
        logger.info(f"Persisted {len(db_transactions)} transactions to database")
        
        # Build summary
        summary_data = build_summary(db_transactions)
        
        # Convert to response format
        transaction_outs = [
            TransactionOut.model_validate(t) for t in db_transactions
        ]
        
        return AnalyzeResponse(
            summary=SummaryData(**summary_data["summary"]),
            categories=summary_data["categories"],
            transactions=transaction_outs
        )
        
    except Exception as e:
        logger.error(f"Error analyzing messages: {str(e)}", exc_info=True)
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze messages: {str(e)}"
        )


@router.get("/transactions", response_model=TransactionListResponse)
async def get_transactions(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    category: Optional[str] = Query(default=None),
    session: Session = Depends(get_session)
) -> TransactionListResponse:
    """
    Get list of transactions with pagination and optional category filter.
    
    Args:
        limit: Maximum number of transactions to return
        offset: Number of transactions to skip
        category: Optional category filter
        session: Database session
        
    Returns:
        TransactionListResponse with transactions and pagination info
    """
    try:
        # Build query
        statement = select(Transaction)
        
        # Apply category filter if provided
        if category:
            statement = statement.where(Transaction.category == category)
        
        # Order by created_at descending (newest first)
        statement = statement.order_by(Transaction.created_at.desc())
        
        # Get total count
        count_statement = select(Transaction)
        if category:
            count_statement = count_statement.where(Transaction.category == category)
        total = len(session.exec(count_statement).all())
        
        # Apply pagination
        statement = statement.offset(offset).limit(limit)
        
        # Execute query
        transactions = session.exec(statement).all()
        
        # Convert to response format
        transaction_outs = [
            TransactionOut.model_validate(t) for t in transactions
        ]
        
        # Build summary from all matching transactions (not just paginated ones)
        all_transactions = session.exec(count_statement).all()
        total_spend = sum(t.amount for t in all_transactions)
        top_category = None
        categories = {}
        top_merchants_list = []
        
        if all_transactions:
            categories = build_category_breakdown(all_transactions)
            if categories:
                top_category = max(categories.items(), key=lambda x: x[1])[0]
            top_merchants_list = get_top_merchants(all_transactions)
        
        summary = SummaryData(
            total_spend=round(total_spend, 2),
            transaction_count=len(all_transactions),
            top_category=top_category,
            categories=categories,
            top_merchants=top_merchants_list
        )
        
        return TransactionListResponse(
            transactions=transaction_outs,
            total=total,
            limit=limit,
            offset=offset,
            summary=summary
        )
        
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch transactions: {str(e)}"
        )
