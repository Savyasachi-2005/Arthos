"""
AI-powered subscription detection service.
Uses Google Gemini to detect recurring subscription payments from UPI transactions.
"""
import logging
import re
from datetime import datetime, date
from typing import Dict, List, Optional, Any
from dateutil.relativedelta import relativedelta

from app.models import Transaction, BillingCycle

logger = logging.getLogger(__name__)

# Subscription keywords for quick filtering
SUBSCRIPTION_KEYWORDS = [
    # Streaming Services - International
    "netflix", "prime", "amazon prime", "disney", "disney+", "disney plus", "hulu", 
    "hbo", "hbo max", "max", "apple tv", "apple tv+", "peacock", "paramount", "paramount+",
    "youtube premium", "youtube tv", "crunchyroll", "mubi", "discovery", "discovery plus",
    "curiositystream", "britbox", "shudder", "sling tv", "amc", "amc+",
    
    # Streaming Services - Indian
    "hotstar", "jiohotstar", "zee5", "sony liv", "sonyliv", "aha", "viu",
    
    # Streaming Services - Asian
    "tencent", "iqiyi", "stan",
    
    # Music Services
    "spotify", "apple music", "amazon music", "youtube music", "tidal", "pandora", 
    "deezer", "gaana", "jio saavn", "jiosaavn",
    
    # Fitness & Lifestyle
    "classpass", "masterclass",
    
    # Software & Tools
    "adobe", "microsoft 365", "hubspot", "webflow", "icloud", "google one",
    
    # Beauty & Fashion
    "sephora", "ipsy", "fabfitfun",
    
    # Generic subscription keywords
    "subscription", "membership", "monthly", "yearly", "annual", "recurring",
    "auto renewal", "renewal", "auto debit", "standing instruction",
    "ott", "streaming", "plan", "package", "recharge", "premium"
]

# Subscription providers with common billing patterns
KNOWN_SUBSCRIPTIONS = {
    # International Streaming Services
    "netflix": {
        "common_amounts": [199, 499, 649, 799],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "amazon prime video": {
        "common_amounts": [179, 459, 999, 1499],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "amazon prime": {
        "common_amounts": [179, 459, 999, 1499],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "disney+": {
        "common_amounts": [299, 599, 799, 1499],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "disney plus": {
        "common_amounts": [299, 599, 799, 1499],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "hulu": {
        "common_amounts": [499, 799, 999],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "hbo max": {
        "common_amounts": [699, 999, 1299],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "max": {
        "common_amounts": [699, 999, 1299],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "apple tv+": {
        "common_amounts": [99, 199, 299],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "apple tv plus": {
        "common_amounts": [99, 199, 299],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "peacock": {
        "common_amounts": [499, 799],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "paramount+": {
        "common_amounts": [499, 799],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "paramount plus": {
        "common_amounts": [499, 799],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "youtube premium": {
        "common_amounts": [129, 149, 179, 199],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "youtube tv": {
        "common_amounts": [3999, 4499],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "crunchyroll": {
        "common_amounts": [299, 499, 799],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "mubi": {
        "common_amounts": [499, 799],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "discovery plus": {
        "common_amounts": [299, 399, 499],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "curiositystream": {
        "common_amounts": [299, 499],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "britbox": {
        "common_amounts": [499, 799],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "shudder": {
        "common_amounts": [399, 599],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "sling tv": {
        "common_amounts": [2499, 3499],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "amc+": {
        "common_amounts": [499, 699],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "amc plus": {
        "common_amounts": [499, 699],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    
    # Indian Streaming Services
    "hotstar": {
        "common_amounts": [299, 399, 499, 799, 1499],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "jiohotstar": {
        "common_amounts": [299, 399, 499, 799, 1499],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "zee5": {
        "common_amounts": [99, 299, 599, 699, 999],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "sonyliv": {
        "common_amounts": [299, 399, 599, 699, 999],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "sony liv": {
        "common_amounts": [299, 399, 599, 699, 999],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "aha": {
        "common_amounts": [199, 299, 365],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "viu": {
        "common_amounts": [99, 199, 299],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    
    # Asian Streaming Services
    "tencent video": {
        "common_amounts": [299, 499, 799],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "iqiyi": {
        "common_amounts": [299, 499, 799],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "stan": {
        "common_amounts": [599, 799, 999],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    
    # Music Streaming Services
    "spotify": {
        "common_amounts": [119, 149, 179, 199],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "apple music": {
        "common_amounts": [99, 149, 199],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "amazon music": {
        "common_amounts": [99, 149, 199],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "youtube music": {
        "common_amounts": [99, 129, 149],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "tidal": {
        "common_amounts": [199, 399],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "pandora": {
        "common_amounts": [299, 499],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "deezer": {
        "common_amounts": [149, 299],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "jio saavn": {
        "common_amounts": [99, 299, 399],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    "gaana": {
        "common_amounts": [99, 299, 399],
        "default_cycle": BillingCycle.monthly,
        "category": "Entertainment"
    },
    
    # Fitness & Lifestyle
    "classpass": {
        "common_amounts": [2999, 4999, 6999],
        "default_cycle": BillingCycle.monthly,
        "category": "Health"
    },
    
    # Education & Professional
    "masterclass": {
        "common_amounts": [999, 1499, 14999],
        "default_cycle": BillingCycle.monthly,
        "category": "Education"
    },
    "hubspot": {
        "common_amounts": [2999, 4999, 9999],
        "default_cycle": BillingCycle.monthly,
        "category": "Software"
    },
    "webflow": {
        "common_amounts": [999, 1999, 2999],
        "default_cycle": BillingCycle.monthly,
        "category": "Software"
    },
    
    # Beauty & Fashion Subscriptions
    "sephora": {
        "common_amounts": [299, 499, 999],
        "default_cycle": BillingCycle.monthly,
        "category": "Shopping"
    },
    "ipsy": {
        "common_amounts": [799, 999, 1999],
        "default_cycle": BillingCycle.monthly,
        "category": "Shopping"
    },
    "ipsy glam bag": {
        "common_amounts": [799, 999, 1999],
        "default_cycle": BillingCycle.monthly,
        "category": "Shopping"
    },
    "fabfitfun": {
        "common_amounts": [3499, 4999],
        "default_cycle": BillingCycle.quarterly,
        "category": "Shopping"
    },
    
    # Software & Cloud Storage
    "adobe": {
        "common_amounts": [1675, 4347],
        "default_cycle": BillingCycle.monthly,
        "category": "Software"
    },
    "microsoft 365": {
        "common_amounts": [420, 489, 5299],
        "default_cycle": BillingCycle.monthly,
        "category": "Software"
    },
    "icloud": {
        "common_amounts": [75, 219, 749],
        "default_cycle": BillingCycle.monthly,
        "category": "Storage"
    },
    "google one": {
        "common_amounts": [130, 210, 650],
        "default_cycle": BillingCycle.monthly,
        "category": "Storage"
    },
}


class DetectedSubscription:
    """Represents a detected subscription from transaction analysis."""
    
    def __init__(
        self,
        name: str,
        amount: float,
        billing_cycle: BillingCycle,
        category: str,
        confidence: float,
        transaction_id: str,
        last_payment_date: Optional[date] = None
    ):
        self.name = name
        self.amount = amount
        self.billing_cycle = billing_cycle
        self.category = category
        self.confidence = confidence
        self.transaction_id = transaction_id
        self.last_payment_date = last_payment_date or date.today()
        
        # Calculate renewal date based on billing cycle
        self.renewal_date = self._calculate_renewal_date()
    
    def _calculate_renewal_date(self) -> date:
        """Calculate next renewal date based on billing cycle."""
        if self.billing_cycle == BillingCycle.monthly:
            return self.last_payment_date + relativedelta(months=1)
        elif self.billing_cycle == BillingCycle.quarterly:
            return self.last_payment_date + relativedelta(months=3)
        elif self.billing_cycle == BillingCycle.yearly:
            return self.last_payment_date + relativedelta(years=1)
        else:
            # Default to monthly
            return self.last_payment_date + relativedelta(months=1)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response."""
        return {
            "name": self.name,
            "amount": self.amount,
            "billing_cycle": self.billing_cycle.value,
            "category": self.category,
            "confidence": self.confidence,
            "transaction_id": self.transaction_id,
            "renewal_date": self.renewal_date.isoformat()
        }


def is_subscription_related(transaction: Transaction) -> bool:
    """
    Quick filter to check if transaction is likely subscription-related.
    
    Args:
        transaction: Transaction to check
        
    Returns:
        True if transaction contains subscription keywords
    """
    text_to_check = f"{transaction.raw_text} {transaction.merchant or ''} {transaction.category}".lower()
    
    return any(keyword in text_to_check for keyword in SUBSCRIPTION_KEYWORDS)


def detect_subscription_from_transaction(transaction: Transaction) -> Optional[DetectedSubscription]:
    """
    Detect if a transaction is a subscription payment using pattern matching.
    
    Args:
        transaction: Transaction to analyze
        
    Returns:
        DetectedSubscription if detected, None otherwise
    """
    if not is_subscription_related(transaction):
        return None
    
    merchant = (transaction.merchant or "").lower()
    raw_text = transaction.raw_text.lower()
    amount = transaction.amount
    category = transaction.category
    
    # Check against known subscription providers
    for provider, details in KNOWN_SUBSCRIPTIONS.items():
        if provider in merchant or provider in raw_text:
            # Found a known platform - always create subscription
            confidence = 0.75  # Base confidence for known platform
            
            # Boost confidence if amount matches known pricing
            if amount in details["common_amounts"]:
                confidence = 0.95
            # Still good confidence if amount is within reasonable range
            elif any(abs(amount - known_amt) <= 100 for known_amt in details["common_amounts"]):
                confidence = 0.85
            
            # Extract subscription name (capitalize properly)
            name = provider.title()
            
            # Determine billing cycle from amount or text
            billing_cycle = details["default_cycle"]
            
            if any(word in raw_text for word in ["yearly", "annual", "year"]):
                billing_cycle = BillingCycle.yearly
                confidence = max(confidence, 0.85)
            elif any(word in raw_text for word in ["quarterly", "quarter"]):
                billing_cycle = BillingCycle.quarterly
                confidence = max(confidence, 0.8)
            
            # Get transaction date
            payment_date = transaction.timestamp.date() if transaction.timestamp else date.today()
            
            return DetectedSubscription(
                name=name,
                amount=amount,
                billing_cycle=billing_cycle,
                category=details["category"],
                confidence=confidence,
                transaction_id=str(transaction.id),
                last_payment_date=payment_date
            )
    
    # Generic subscription detection for unknown providers
    if any(word in raw_text for word in ["subscription", "membership", "renewal", "auto renewal"]):
        confidence = 0.65  # Decent confidence for generic subscription
        
        # Try to extract service name
        name = transaction.merchant or "Unknown Subscription"
        if name and name != "Unknown":
            name = name.title()
            confidence = 0.75  # Better confidence if we have a name
        
        # Determine billing cycle from text
        billing_cycle = BillingCycle.monthly
        if any(word in raw_text for word in ["yearly", "annual", "year"]):
            billing_cycle = BillingCycle.yearly
            confidence += 0.1
        elif any(word in raw_text for word in ["quarterly", "quarter"]):
            billing_cycle = BillingCycle.quarterly
            confidence += 0.05
        
        payment_date = transaction.timestamp.date() if transaction.timestamp else date.today()
        
        return DetectedSubscription(
            name=name,
            amount=amount,
            billing_cycle=billing_cycle,
            category=category,
            confidence=min(confidence, 0.99),  # Cap at 99%
            transaction_id=str(transaction.id),
            last_payment_date=payment_date
        )
    
    return None


def detect_subscriptions_from_transactions(
    transactions: List[Transaction],
    min_confidence: float = 0.5
) -> List[DetectedSubscription]:
    """
    Analyze multiple transactions and detect potential subscriptions.
    
    Args:
        transactions: List of transactions to analyze
        min_confidence: Minimum confidence threshold (0.0 to 1.0)
        
    Returns:
        List of detected subscriptions above confidence threshold
    """
    detected_subscriptions = []
    
    for transaction in transactions:
        detected = detect_subscription_from_transaction(transaction)
        
        if detected and detected.confidence >= min_confidence:
            detected_subscriptions.append(detected)
            logger.info(
                f"Detected subscription: {detected.name} (₹{detected.amount}) "
                f"with confidence {detected.confidence:.2f}"
            )
    
    return detected_subscriptions


def group_recurring_transactions(
    transactions: List[Transaction],
    tolerance_days: int = 7
) -> Dict[str, List[Transaction]]:
    """
    Group transactions that appear to be recurring (same merchant, similar amounts, regular intervals).
    
    Args:
        transactions: List of transactions to analyze
        tolerance_days: Number of days tolerance for "monthly" pattern
        
    Returns:
        Dictionary mapping merchant to list of recurring transactions
    """
    # Group by merchant
    merchant_groups: Dict[str, List[Transaction]] = {}
    
    for txn in transactions:
        merchant = txn.merchant or "Unknown"
        if merchant not in merchant_groups:
            merchant_groups[merchant] = []
        merchant_groups[merchant].append(txn)
    
    # Filter groups with multiple transactions
    recurring_groups = {}
    for merchant, txns in merchant_groups.items():
        if len(txns) >= 2:
            # Sort by timestamp
            sorted_txns = sorted(
                [t for t in txns if t.timestamp],
                key=lambda t: t.timestamp
            )
            
            if len(sorted_txns) >= 2:
                # Check for regular intervals
                intervals = []
                for i in range(1, len(sorted_txns)):
                    delta = (sorted_txns[i].timestamp - sorted_txns[i-1].timestamp).days
                    intervals.append(delta)
                
                # Check if intervals are consistent (around 30 days for monthly)
                if intervals:
                    avg_interval = sum(intervals) / len(intervals)
                    if 20 <= avg_interval <= 40:  # Roughly monthly
                        recurring_groups[merchant] = sorted_txns
                        logger.info(
                            f"Found recurring pattern for {merchant}: "
                            f"{len(sorted_txns)} transactions, avg interval {avg_interval:.1f} days"
                        )
    
    return recurring_groups
