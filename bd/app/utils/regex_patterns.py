"""
Regex patterns and utilities for parsing UPI/SMS/bank messages.
Contains patterns for Indian transaction message formats.
"""
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)


# Amount patterns - matches various Indian currency formats
# Order matters - more specific patterns first
AMOUNT_PATTERNS = [
    # UPI Mandate format: "for Rs.599.00" or "Rs.599.00 is"
    r'(?i)(?:for\s+)?Rs\.?\s?(\d{1,10}(?:,\d{2,3})*(?:\.\d{1,2})?)',
    # INR with DEBITED/CREDITED: "INR 120.00 has been DEBITED"
    r'(?i)INR\s?(\d{1,10}(?:,\d{2,3})*(?:\.\d{1,2})?)\s+(?:has\s+been\s+)?(?:debited|credited)',
    # SBI format: "debited by 45.0" (plain number)
    r'(?i)(?:debited|credited)\s+(?:by\s+)?(\d{1,10}(?:\.\d{1,2})?)',
    # Standard debited/credited with currency
    r'(?i)(?:debited|credited)\s+(?:by\s+)?(?:INR|Rs\.?)\s?(\d{1,10}(?:,\d{2,3})*(?:\.\d{1,2})?)',
    # INR at start: "INR 219.00"
    r'(?i)INR\s?(\d{1,10}(?:,\d{2,3})*(?:\.\d{1,2})?)',
    # Rupee symbol: ₹1,299 or ₹1299.50
    r'₹\s?(\d{1,10}(?:,\d{2,3})*(?:\.\d{1,2})?)',
    # Payment of amount
    r'(?i)payment\s+of\s+(?:INR|Rs\.?|₹)?\s?(\d{1,10}(?:,\d{2,3})*(?:\.\d{1,2})?)',
    # Amount with "paid" keyword
    r'(?i)(?:paid|amount)\s+(?:INR|Rs\.?|₹)?\s?(\d{1,10}(?:,\d{2,3})*(?:\.\d{1,2})?)',
    # Generic currency pattern - last resort
    r'(?:INR|Rs\.?|₹)\s?(\d{1,10}(?:,\d{2,3})*(?:\.\d{1,2})?)',
]

# Date patterns for common Indian formats
DATE_PATTERNS = [
    # DD/MM/YYYY format: "21/11/2025"
    (r'(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})', '%d-%m-%Y'),
    # SBI format: 05Nov25 or 05Nov2025
    (r'(\d{1,2})(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(\d{2,4})', '%d%b%y'),
    # DD Mon YYYY with space: "20 Nov 2025"
    (r'(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})', '%d %b %Y'),
    # YYYY-MM-DD format
    (r'(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})', '%Y-%m-%d'),
    # DD-Mon-YY with dash: "05-Nov-25"
    (r'(\d{1,2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2})', '%d-%b-%y'),
    # Month name variations: "Nov 20, 2025"
    (r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})', '%b %d %Y'),
]

# Merchant extraction patterns - looks for merchant names in common phrases
# Order matters - more specific patterns first
STOP_WORDS = {"your", "account", "acct", "a/c", "upi"}

MERCHANT_PATTERNS = [
    # UPI Mandate: "towards STORYTV from"
    r'(?i)towards\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+from|\s+A/c)',
    # SBI format: "trf to <merchant> Refno" or "trf to <merchant> on"
    r'(?i)trf\s+to\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+Refno|\s+on|\s+ref|\s+from)',
    # Standard: "paid to <merchant>"
    r'(?i)(?:paid?\s+)?to\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+on|\s+was|\s+for|\.|\s+UPI|\s+Ref|\s+from)',
    # "at <merchant>"
    r'(?i)at\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+on|\s+was|\s+for|\.|\s+Dial)',
    # "payment to <merchant>"
    r'(?i)payment\s+to\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+on|\s+was|\.|\s+Ref|\s+from)',
    # "for UPI payment to <merchant>"
    r'(?i)for\s+UPI\s+payment\s+to\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+on|\.|\s+from)',
    # HDFC/ICICI: "with <merchant>"
    r'(?i)with\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+on|\s+is|\.|\s+from)',
    # Generic: look for capitalized words after common keywords
    r'(?i)(?:from|merchant|vendor)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s|\.|\s+on)',
]


def extract_amount(text: str) -> Optional[float]:
    """
    Extract amount from text using regex patterns.
    
    Args:
        text: Transaction text to parse
        
    Returns:
        Extracted amount as float, or None if not found
    """
    for pattern in AMOUNT_PATTERNS:
        match = re.search(pattern, text)
        if match:
            # Get the captured amount string
            amount_str = match.group(1)
            # Remove commas and convert to float
            try:
                return float(amount_str.replace(',', ''))
            except ValueError:
                continue
    return None


def extract_merchant(text: str) -> Optional[str]:
    """
    Extract merchant name from text using regex patterns.
    
    Args:
        text: Transaction text to parse
        
    Returns:
        Extracted merchant name, or None if not found
    """
    for pattern in MERCHANT_PATTERNS:
        match = re.search(pattern, text)
        if match:
            merchant = match.group(1).strip()
            # Clean up merchant name (remove extra spaces, trailing punctuation)
            merchant = re.sub(r'\s+', ' ', merchant)
            merchant = merchant.rstrip('.,;:')
            if len(merchant) > 2 and merchant.lower() not in STOP_WORDS:
                return merchant
    return None


def extract_date(text: str) -> Optional[str]:
    """
    Extract date from text and return in ISO format.
    
    Args:
        text: Transaction text to parse
        
    Returns:
        Date string in ISO format (YYYY-MM-DD), or None if not found
    """
    from datetime import datetime
    
    for pattern, date_format in DATE_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                groups = match.groups()
                
                # Handle different date format structures
                if date_format == '%b %d %Y':
                    # Month Day Year format
                    month = groups[0].capitalize()
                    day = groups[1].zfill(2)
                    year = groups[2]
                    date_str = f"{month} {day} {year}"
                    
                elif '%b' in date_format.lower():
                    # Month name patterns
                    day = groups[0].zfill(2)
                    month = groups[1].capitalize()
                    year = groups[2]
                    
                    # Handle 2-digit years (25 -> 2025)
                    if len(year) == 2:
                        year_int = int(year)
                        year = f"20{year}" if year_int <= 50 else f"19{year}"
                        date_format = date_format.replace('%y', '%Y')
                    
                    # Build date string based on format
                    if date_format == '%d%b%y' or date_format == '%d%b%Y':
                        date_str = f"{day}{month}{year}"
                    elif date_format == '%d-%b-%y' or date_format == '%d-%b-%Y':
                        date_str = f"{day}-{month}-{year}"
                    else:
                        date_str = f"{day} {month} {year}"
                        date_format = '%d %b %Y'
                        
                elif date_format == '%Y-%m-%d':
                    # YYYY-MM-DD format
                    date_str = f"{groups[0]}-{groups[1].zfill(2)}-{groups[2].zfill(2)}"
                else:
                    # DD-MM-YYYY or DD/MM/YYYY format
                    date_str = f"{groups[0].zfill(2)}-{groups[1].zfill(2)}-{groups[2]}"
                
                # Parse and return in ISO format
                dt = datetime.strptime(date_str, date_format)
                return dt.strftime('%Y-%m-%d')
            except (ValueError, IndexError) as e:
                logger.debug(f"Failed to parse date from pattern {pattern}: {e}")
                continue
    return None


def normalize_text(text: str) -> str:
    """
    Normalize text for better parsing.
    
    Args:
        text: Raw text to normalize
        
    Returns:
        Normalized text
    """
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    # Strip leading/trailing whitespace
    return text.strip()
