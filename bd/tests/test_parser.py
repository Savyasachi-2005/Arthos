"""
Unit tests for UPI message parser.
Tests parsing of various SMS/bank message formats.
"""
import pytest
from datetime import datetime

from app.services.upi_parser import (
    parse_message_line,
    parse_messages,
    extract_transaction_details,
)
from app.utils.regex_patterns import (
    extract_amount,
    extract_merchant,
    extract_date,
)


class TestAmountExtraction:
    """Tests for amount extraction from messages."""
    
    def test_extract_rs_format(self):
        """Test Rs. format extraction."""
        text = "Rs. 249.00 paid to Zomato on 20-11-2025"
        amount = extract_amount(text)
        assert amount == 249.00
    
    def test_extract_inr_format(self):
        """Test INR format extraction."""
        text = "INR 219.00 paid to OLA CABS on 2025-11-20"
        amount = extract_amount(text)
        assert amount == 219.00
    
    def test_extract_rupee_symbol(self):
        """Test ₹ symbol extraction."""
        text = "Payment of ₹1,299 to Amazon was successful"
        amount = extract_amount(text)
        assert amount == 1299.0
    
    def test_extract_amount_with_commas(self):
        """Test amount with comma separators."""
        text = "Paid Rs. 12,345.50 to merchant"
        amount = extract_amount(text)
        assert amount == 12345.50
    
    def test_extract_debited_format(self):
        """Test 'debited by' format."""
        text = "Your a/c was debited by INR 499.00"
        amount = extract_amount(text)
        assert amount == 499.00
    
    def test_no_amount_found(self):
        """Test when no amount is present."""
        text = "This is just a regular message"
        amount = extract_amount(text)
        assert amount is None


class TestMerchantExtraction:
    """Tests for merchant name extraction."""
    
    def test_extract_paid_to_format(self):
        """Test 'paid to' format."""
        text = "Rs. 249.00 paid to Zomato on 20-11-2025"
        merchant = extract_merchant(text)
        assert merchant == "Zomato"
    
    def test_extract_payment_to_format(self):
        """Test 'payment to' format."""
        text = "Payment of ₹1,299 to Amazon was successful"
        merchant = extract_merchant(text)
        assert merchant == "Amazon"
    
    def test_extract_upi_payment_format(self):
        """Test 'for UPI payment to' format."""
        text = "Your a/c was debited for UPI payment to OLA CABS on 2025-11-20"
        merchant = extract_merchant(text)
        assert merchant == "OLA CABS"
    
    def test_extract_at_format(self):
        """Test 'at merchant' format."""
        text = "Card transaction at BIG BAZAAR for Rs 500"
        merchant = extract_merchant(text)
        assert merchant == "BIG BAZAAR"
    
    def test_no_merchant_found(self):
        """Test when no merchant is present."""
        text = "INR 100 credited to your account"
        merchant = extract_merchant(text)
        assert merchant is None


class TestDateExtraction:
    """Tests for date extraction."""
    
    def test_extract_dd_mm_yyyy_hyphen(self):
        """Test DD-MM-YYYY format."""
        text = "Payment on 20-11-2025 was successful"
        date = extract_date(text)
        assert date == "2025-11-20"
    
    def test_extract_dd_mm_yyyy_slash(self):
        """Test DD/MM/YYYY format."""
        text = "Transaction on 19/11/2025"
        date = extract_date(text)
        assert date == "2025-11-19"
    
    def test_extract_dd_mon_yyyy(self):
        """Test DD Mon YYYY format."""
        text = "Payment on 20 Nov 2025"
        date = extract_date(text)
        assert date == "2025-11-20"
    
    def test_extract_yyyy_mm_dd(self):
        """Test YYYY-MM-DD format."""
        text = "Transaction dated 2025-11-20"
        date = extract_date(text)
        assert date == "2025-11-20"
    
    def test_no_date_found(self):
        """Test when no date is present."""
        text = "Payment was successful"
        date = extract_date(text)
        assert date is None


class TestMessageParsing:
    """Tests for complete message parsing."""
    
    def test_parse_zomato_message(self):
        """Test parsing Zomato SMS."""
        message = "Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345"
        parsed = parse_message_line(message)
        
        assert parsed is not None
        assert parsed.amount == 249.00
        assert parsed.merchant == "Zomato"
        assert parsed.timestamp is not None
        assert parsed.timestamp.year == 2025
        assert parsed.timestamp.month == 11
        assert parsed.timestamp.day == 20
    
    def test_parse_ola_message(self):
        """Test parsing OLA CABS SMS."""
        message = "Your a/c XX1234 was debited by INR 219.00 for UPI payment to OLA CABS on 2025-11-20."
        parsed = parse_message_line(message)
        
        assert parsed is not None
        assert parsed.amount == 219.00
        assert parsed.merchant == "OLA CABS"
    
    def test_parse_amazon_message(self):
        """Test parsing Amazon SMS."""
        message = "Payment of ₹1,299 to Amazon was successful on 19/11/2025"
        parsed = parse_message_line(message)
        
        assert parsed is not None
        assert parsed.amount == 1299.0
        assert parsed.merchant == "Amazon"
    
    def test_parse_netflix_message(self):
        """Test parsing Netflix SMS."""
        message = "INR 499.00 paid to Netflix. Next billing date 01-12-2025"
        parsed = parse_message_line(message)
        
        assert parsed is not None
        assert parsed.amount == 499.00
        assert parsed.merchant == "Netflix"
    
    def test_parse_message_no_merchant(self):
        """Test parsing message without merchant."""
        message = "Rs. 500 debited from your account on 20-11-2025"
        parsed = parse_message_line(message)
        
        assert parsed is not None
        assert parsed.amount == 500.0
        assert parsed.merchant == "Unknown"
    
    def test_parse_invalid_message(self):
        """Test parsing message with no amount."""
        message = "This is a random message without transaction details"
        parsed = parse_message_line(message)
        
        assert parsed is None
    
    def test_parse_multiple_messages(self):
        """Test parsing multiple messages."""
        raw_text = """Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345
INR 219 paid to OLA CABS on 20-11-2025.
Payment of ₹1,299 to Amazon was successful"""
        
        transactions = parse_messages(raw_text)
        
        assert len(transactions) == 3
        assert transactions[0].amount == 249.00
        assert transactions[1].amount == 219.0
        assert transactions[2].amount == 1299.0
    
    def test_parse_empty_message(self):
        """Test parsing empty message."""
        transactions = parse_messages("")
        assert len(transactions) == 0
    
    def test_parse_message_with_empty_lines(self):
        """Test parsing messages with empty lines."""
        raw_text = """Rs. 249.00 paid to Zomato on 20-11-2025

INR 219 paid to OLA CABS on 20-11-2025
"""
        transactions = parse_messages(raw_text)
        assert len(transactions) == 2


class TestTransactionDetails:
    """Tests for extract_transaction_details helper."""
    
    def test_extract_valid_transaction(self):
        """Test extracting details from valid message."""
        message = "Rs. 249.00 paid to Zomato on 20-11-2025"
        details = extract_transaction_details(message)
        
        assert details["amount"] == 249.00
        assert details["merchant"] == "Zomato"
        assert details["raw_text"] == message
    
    def test_extract_invalid_transaction(self):
        """Test extracting details from invalid message."""
        message = "No transaction here"
        details = extract_transaction_details(message)
        
        assert details["amount"] == 0.0
        assert details["merchant"] == "Unknown"
