"""
Summary builder service.
Builds analytics and summary statistics from transactions.
"""
import logging
from typing import Dict, List, Optional

from app.models import Transaction

logger = logging.getLogger(__name__)


def build_summary(transactions: List[Transaction]) -> Dict:
    """
    Build summary statistics from a list of transactions.
    
    Args:
        transactions: List of Transaction model instances
        
    Returns:
        Dictionary containing summary, categories breakdown
    """
    if not transactions:
        return {
            "summary": {
                "total_spend": 0.0,
                "transaction_count": 0,
                "top_category": None
            },
            "categories": {}
        }
    
    # Calculate totals
    total_spend = sum(t.amount for t in transactions)
    transaction_count = len(transactions)
    
    # Build category-wise breakdown
    category_totals: Dict[str, float] = {}
    for transaction in transactions:
        category = transaction.category
        category_totals[category] = category_totals.get(category, 0.0) + transaction.amount
    
    # Find top category
    top_category = None
    if category_totals:
        top_category = max(category_totals.items(), key=lambda x: x[1])[0]
    
    logger.info(
        f"Summary: total_spend={total_spend:.2f}, "
        f"transaction_count={transaction_count}, "
        f"top_category={top_category}"
    )
    
    return {
        "summary": {
            "total_spend": round(total_spend, 2),
            "transaction_count": transaction_count,
            "top_category": top_category
        },
        "categories": {k: round(v, 2) for k, v in category_totals.items()}
    }


def build_category_breakdown(transactions: List[Transaction]) -> Dict[str, float]:
    """
    Build category-wise spending breakdown.
    
    Args:
        transactions: List of Transaction model instances
        
    Returns:
        Dictionary mapping category names to total amounts
    """
    category_totals: Dict[str, float] = {}
    
    for transaction in transactions:
        category = transaction.category
        category_totals[category] = category_totals.get(category, 0.0) + transaction.amount
    
    return {k: round(v, 2) for k, v in category_totals.items()}


def get_top_categories(transactions: List[Transaction], limit: int = 5) -> List[Dict]:
    """
    Get top N categories by spending.
    
    Args:
        transactions: List of Transaction model instances
        limit: Maximum number of categories to return
        
    Returns:
        List of dictionaries with category name and total amount
    """
    category_totals = build_category_breakdown(transactions)
    
    # Sort by amount descending
    sorted_categories = sorted(
        category_totals.items(),
        key=lambda x: x[1],
        reverse=True
    )[:limit]
    
    return [
        {"category": cat, "total": amount}
        for cat, amount in sorted_categories
    ]


def calculate_average_transaction(transactions: List[Transaction]) -> float:
    """
    Calculate average transaction amount.
    
    Args:
        transactions: List of Transaction model instances
        
    Returns:
        Average transaction amount
    """
    if not transactions:
        return 0.0
    
    total = sum(t.amount for t in transactions)
    return round(total / len(transactions), 2)


def get_top_merchants(transactions: List[Transaction], limit: int = 10) -> List[Dict]:
    """
    Get top N merchants by total spending.
    
    Args:
        transactions: List of Transaction model instances
        limit: Maximum number of merchants to return
        
    Returns:
        List of dictionaries with merchant name, total spent, and transaction count
    """
    if not transactions:
        return []
    
    # Build merchant totals
    merchant_data: Dict[str, Dict] = {}
    
    for transaction in transactions:
        merchant = transaction.merchant or "Unknown"
        if merchant not in merchant_data:
            merchant_data[merchant] = {"total_spent": 0.0, "count": 0}
        
        merchant_data[merchant]["total_spent"] += transaction.amount
        merchant_data[merchant]["count"] += 1
    
    # Sort by total spent descending
    sorted_merchants = sorted(
        merchant_data.items(),
        key=lambda x: x[1]["total_spent"],
        reverse=True
    )[:limit]
    
    return [
        {
            "merchant": merchant,
            "total_spent": round(data["total_spent"], 2),
            "count": data["count"]
        }
        for merchant, data in sorted_merchants
    ]
