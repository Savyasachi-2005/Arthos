"""
UPI/SMS message parser service.
Extracts transaction details from raw message text.
"""
import logging
from datetime import datetime
from typing import Dict, List, Optional

from app.utils.regex_patterns import (
    extract_amount,
    extract_date,
    extract_merchant,
    normalize_text,
)

logger = logging.getLogger(__name__)


class ParsedTransaction:
    """
    Data class for a parsed transaction.
    """
    def __init__(
        self,
        raw_text: str,
        amount: float,
        merchant: Optional[str] = None,
        timestamp: Optional[datetime] = None
    ):
        self.raw_text = raw_text
        self.amount = amount
        self.merchant = merchant or "Unknown"
        self.timestamp = timestamp
    
    def to_dict(self) -> Dict:
        """Convert to dictionary format."""
        return {
            "raw_text": self.raw_text,
            "amount": self.amount,
            "merchant": self.merchant,
            "timestamp": self.timestamp,
        }


def parse_message_line(line: str) -> Optional[ParsedTransaction]:
    """
    Parse a single message line and extract transaction details.
    
    Args:
        line: Single line of SMS/bank message text
        
    Returns:
        ParsedTransaction if amount found and valid, else None
    """
    # Normalize the text
    line = normalize_text(line)
    
    # Skip empty lines
    if not line:
        return None
    
    # Extract amount (required)
    amount = extract_amount(line)
    if amount is None or amount <= 0:
        logger.debug(f"No valid amount found in line: {line[:50]}...")
        return None
    
    # Extract merchant (optional)
    merchant = extract_merchant(line)
    
    # Extract date (optional)
    date_str = extract_date(line)
    timestamp = None
    if date_str:
        try:
            timestamp = datetime.fromisoformat(date_str)
        except ValueError:
            logger.warning(f"Failed to parse date: {date_str}")
    
    logger.info(f"Parsed transaction: amount={amount}, merchant={merchant}, date={date_str}")
    
    return ParsedTransaction(
        raw_text=line,
        amount=amount,
        merchant=merchant,
        timestamp=timestamp
    )


def parse_messages(raw_text: str) -> List[ParsedTransaction]:
    """
    Parse multiple lines of messages and extract all transactions.
    Supports various delimiters: newlines, multiple newlines, or semicolons.
    
    Args:
        raw_text: Raw text containing one or more SMS/bank messages
        
    Returns:
        List of ParsedTransaction objects
    """
    transactions = []
    
    # Normalize different line endings
    raw_text = raw_text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Split by newlines first
    lines = raw_text.strip().split('\n')
    logger.info(f"Processing {len(lines)} lines of text")
    
    for line in lines:
        # Skip empty or very short lines
        line = line.strip()
        if not line or len(line) < 10:
            continue
            
        # Check if line contains multiple transactions separated by semicolon or pipe
        if ';' in line or '|' in line:
            # Split by semicolon or pipe and process each part
            delimiter = ';' if ';' in line else '|'
            sub_lines = [s.strip() for s in line.split(delimiter)]
            for sub_line in sub_lines:
                if sub_line and len(sub_line) >= 10:
                    parsed = parse_message_line(sub_line)
                    if parsed:
                        transactions.append(parsed)
        else:
            # Process as single transaction
            parsed = parse_message_line(line)
            if parsed:
                transactions.append(parsed)
    
    logger.info(f"Successfully parsed {len(transactions)} transactions from input")
    return transactions


def extract_transaction_details(raw_text: str) -> Dict:
    """
    Extract transaction details from a single message.
    Convenience function for single-message parsing.
    
    Args:
        raw_text: Single SMS/bank message
        
    Returns:
        Dictionary with extracted details
    """
    parsed = parse_message_line(raw_text)
    if parsed:
        return parsed.to_dict()
    return {
        "raw_text": raw_text,
        "amount": 0.0,
        "merchant": "Unknown",
        "timestamp": None,
    }
