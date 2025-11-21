"""
Category mapping service.
Maps transactions to categories based on keywords.
"""
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

# Category keyword mappings
CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "Food": [
        "zomato", "swiggy", "food", "restaurant", "cafe", "pizza", "burger",
        "dominos", "mcdonald", "kfc", "subway", "starbucks", "dunkin",
        "barbeque", "dining", "eatery", "kitchen", "biryani", "canteen",
        "mess", "dhaba", "tiffin", "lunch", "breakfast", "dinner", "snacks"
    ],
    "Travel": [
        "ola", "uber", "rapido", "cab", "taxi", "metro", "railway", "irctc",
        "flight", "airline", "indigo", "spicejet", "goair", "vistara",
        "bus", "redbus", "train", "makemytrip", "yatra", "cleartrip",
        "travel", "booking", "hotel", "oyo", "petrol", "fuel", "parking"
    ],
    "Bills": [
        "electricity", "electric", "water", "gas", "bill", "recharge",
        "mobile", "airtel", "jio", "vi", "vodafone", "broadband", "wifi",
        "internet", "postpaid", "utility", "bsnl", "tata sky", "dish tv",
        "dth", "prepaid", "telephone"
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "ajio", "shopping", "store",
        "mall", "retail", "fashion", "clothing", "shoes", "accessories",
        "electronics", "gadgets", "meesho", "snapdeal", "nykaa", "lifestyle",
        "shoppers stop", "pantaloons", "westside"
    ],
    "Groceries": [
        "grocery", "supermarket", "mart", "bigbasket", "grofers", "blinkit",
        "dunzo", "instamart", "zepto", "jiomart", "dmart", "reliance fresh",
        "more", "vegetables", "fruits", "kirana", "provisions"
    ],
    "Entertainment": [
        "netflix", "prime", "hotstar", "disney", "sony liv", "zee5",
        "entertainment", "movie", "cinema", "pvr", "inox", "theatre",
        "spotify", "youtube", "gaana", "music", "gaming", "game",
        "concert", "event", "show", "storytv", "sony", "ott", "streaming",
        "subscription", "jio tv", "airtel tv"
    ],
    "Education": [
        "education", "course", "tuition", "school", "college", "university",
        "udemy", "coursera", "byju", "unacademy", "vedantu", "learning",
        "books", "stationery", "exam", "fees", "institute", "academy"
    ],
    "Health": [
        "hospital", "clinic", "doctor", "medical", "pharmacy", "medicine",
        "health", "apollo", "fortis", "max", "medanta", "pharma",
        "diagnostic", "lab", "test", "gym", "fitness", "cult fit",
        "wellness", "dental", "physiotherapy"
    ],
}


def map_category(raw_text: str, merchant: Optional[str]) -> str:
    """
    Map transaction to category based on keywords in text and merchant name.
    
    Args:
        raw_text: Original transaction message
        merchant: Extracted merchant name (can be None or "Unknown")
        
    Returns:
        Category name (defaults to "Others" if no match)
    """
    # Combine text sources for matching
    text_to_check = raw_text.lower()
    if merchant and merchant != "Unknown":
        text_to_check += " " + merchant.lower()
    
    # Check each category's keywords
    matched_categories = []
    
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in text_to_check:
                matched_categories.append(category)
                break  # Move to next category after first match
    
    # Return first matched category or "Others"
    if matched_categories:
        category = matched_categories[0]
        logger.debug(f"Mapped to category '{category}' based on keywords")
        return category
    
    logger.debug("No category match found, defaulting to 'Others'")
    return "Others"


def get_all_categories() -> List[str]:
    """
    Get list of all available categories.
    
    Returns:
        List of category names including "Others"
    """
    return list(CATEGORY_KEYWORDS.keys()) + ["Others"]


def add_category_keywords(category: str, keywords: List[str]) -> None:
    """
    Add custom keywords to a category (for extensibility).
    
    Args:
        category: Category name
        keywords: List of keywords to add
    """
    if category not in CATEGORY_KEYWORDS:
        CATEGORY_KEYWORDS[category] = []
    
    CATEGORY_KEYWORDS[category].extend(keywords)
    logger.info(f"Added {len(keywords)} keywords to category '{category}'")
