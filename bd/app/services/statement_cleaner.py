"""
Service for cleaning and preprocessing bank statement text.
Removes noise, normalizes formatting, and extracts relevant transaction lines.
"""
import logging
import re
from typing import List, Tuple

logger = logging.getLogger(__name__)


class StatementCleaner:
    """Service for cleaning and preprocessing bank statement text."""
    
    # Common noise patterns in bank statements
    NOISE_PATTERNS = [
        r'^\s*$',  # Empty lines
        r'^={3,}',  # Separator lines
        r'^-{3,}',  # Dashed lines
        r'^\*{3,}',  # Asterisk lines
        r'^Page \d+',  # Page numbers
        r'^\s*\d+\s*$',  # Standalone numbers
        r'CONFIDENTIAL',
        r'STATEMENT OF ACCOUNT',
        r'This is a computer generated',
        r'Thank you for banking',
        r'For any queries',
        r'Customer Care',
        r'^\s*continued',
    ]
    
    # Patterns that indicate transaction lines
    TRANSACTION_INDICATORS = [
        r'\b(UPI|NEFT|IMPS|RTGS|ATM|POS|DEBIT|CREDIT|WITHDRAWAL|DEPOSIT|TRANSFER)\b',
        r'\b(Dr|Cr|DB|CR)\b',
        r'Rs\.?\s*\d+',
        r'\d+\.\d{2}',  # Amount with decimals
        r'\d{2}[-/]\d{2}[-/]\d{2,4}',  # Date patterns
    ]
    
    def __init__(self):
        """Initialize statement cleaner with compiled regex patterns."""
        self.noise_regex = [re.compile(pattern, re.IGNORECASE) for pattern in self.NOISE_PATTERNS]
        self.transaction_regex = [re.compile(pattern, re.IGNORECASE) for pattern in self.TRANSACTION_INDICATORS]
    
    def clean_text(self, raw_text: str) -> str:
        """
        Clean raw bank statement text.
        
        Args:
            raw_text: Raw text extracted from statement
            
        Returns:
            Cleaned text with normalized whitespace
        """
        if not raw_text:
            return ""
        
        logger.info(f"Cleaning text of length {len(raw_text)}")
        
        # Normalize line endings
        text = raw_text.replace('\r\n', '\n').replace('\r', '\n')
        
        # Remove excessive whitespace
        text = re.sub(r'[ \t]+', ' ', text)
        
        # Remove excessive newlines (but keep paragraph breaks)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Remove leading/trailing whitespace from each line
        lines = [line.strip() for line in text.split('\n')]
        
        # Join back
        cleaned = '\n'.join(lines)
        
        logger.info(f"Cleaned text length: {len(cleaned)}")
        return cleaned
    
    def extract_transaction_lines(self, text: str) -> List[str]:
        """
        Extract lines that likely contain transaction information.
        
        Args:
            text: Cleaned bank statement text
            
        Returns:
            List of lines that appear to be transactions
        """
        lines = text.split('\n')
        transaction_lines = []
        
        for line in lines:
            # Skip empty lines
            if not line.strip():
                continue
            
            # Skip noise patterns
            if any(pattern.search(line) for pattern in self.noise_regex):
                continue
            
            # Include lines that match transaction indicators
            if any(pattern.search(line) for pattern in self.transaction_regex):
                transaction_lines.append(line)
        
        logger.info(f"Extracted {len(transaction_lines)} potential transaction lines from {len(lines)} total lines")
        return transaction_lines
    
    def normalize_amount(self, amount_str: str) -> float:
        """
        Normalize amount string to float.
        
        Args:
            amount_str: Amount string (e.g., "Rs. 1,234.56", "1234.56", "1,234")
            
        Returns:
            Float value of amount
        """
        # Remove currency symbols and commas
        cleaned = re.sub(r'[Rs.,₹\s]', '', amount_str)
        
        try:
            return float(cleaned)
        except ValueError:
            logger.warning(f"Failed to parse amount: {amount_str}")
            return 0.0
    
    def extract_dates(self, text: str) -> List[str]:
        """
        Extract date strings from text.
        
        Args:
            text: Text to search for dates
            
        Returns:
            List of date strings found
        """
        date_patterns = [
            r'\d{2}[-/]\d{2}[-/]\d{4}',  # DD-MM-YYYY or DD/MM/YYYY
            r'\d{4}[-/]\d{2}[-/]\d{2}',  # YYYY-MM-DD
            r'\d{2}[-/]\d{2}[-/]\d{2}',  # DD-MM-YY
            r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}',  # DD Mon YYYY
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates.extend(matches)
        
        return dates
    
    def preprocess_for_ai(self, raw_text: str) -> Tuple[str, List[str]]:
        """
        Full preprocessing pipeline for AI analysis.
        
        Args:
            raw_text: Raw bank statement text
            
        Returns:
            Tuple of (cleaned_text, transaction_lines)
        """
        # Clean the text
        cleaned_text = self.clean_text(raw_text)
        
        # Extract transaction lines
        transaction_lines = self.extract_transaction_lines(cleaned_text)
        
        # If very few transaction lines found, use full text
        if len(transaction_lines) < 5:
            logger.warning("Few transaction lines detected, using full cleaned text")
            transaction_lines = [line for line in cleaned_text.split('\n') if line.strip()]
        
        return cleaned_text, transaction_lines


# Singleton instance
statement_cleaner = StatementCleaner()
