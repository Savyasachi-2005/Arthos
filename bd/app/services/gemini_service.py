"""
Gemini AI service for intelligent bank statement analysis.
Uses Google's Gemini API to analyze transactions and provide insights.
"""
import json
import logging
import os
import re
from typing import Dict, List, Optional

import google.generativeai as genai
from dotenv import load_dotenv

from app.schemas.bank import (
    AnalysisSummary,
    AnalyzeStatementResponse,
    BankTransaction,
)

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for analyzing bank statements using Gemini AI."""
    
    def __init__(self):
        """Initialize Gemini AI service with API key."""
        self.api_key = os.getenv("GEMINI_API_KEY")
        
        if not self.api_key:
            logger.error("GEMINI_API_KEY not found in environment variables")
            raise ValueError("GEMINI_API_KEY must be set in .env file")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Use Gemini 1.5 Flash (stable, widely available model)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
        logger.info("Gemini AI service initialized successfully")
    
    def _build_analysis_prompt(self, statement_text: str) -> str:
        """
        Build the prompt for Gemini AI analysis.
        
        Args:
            statement_text: Cleaned bank statement text
            
        Returns:
            Formatted prompt for Gemini
        """
        prompt = f"""Analyze this bank statement and extract financial data. Return ONLY a valid JSON object (no markdown, no explanation).

Statement:
{statement_text}

Required JSON format:
{{
  "summary": {{
    "total_spend": 0.0,
    "total_income": 0.0,
    "top_category": "Food",
    "top_merchant": "Amazon",
    "wasteful_spending": ["Zomato", "Swiggy"],
    "monthly_summary": {{"Jan": 5000, "Feb": 6000}},
    "category_breakdown": {{"Food": 2000, "Shopping": 3000}}
  }},
  "transactions": [
    {{"date": "2025-01-15", "merchant": "Amazon", "amount": 499.99, "category": "Shopping", "type": "debit"}}
  ],
  "anomalies": ["Unusual charge: Rs 5000 to XYZ"],
  "recommendations": ["Reduce food delivery expenses"],
  "subscriptions_detected": ["Netflix", "Spotify"],
  "duplicate_charges": ["Rs 299 charged twice on same day"]
}}

Categories: Food, Shopping, Transport, Entertainment, Bills, Healthcare, Education, Groceries, Dining, Subscriptions, Insurance, Rent, Other

Extract all transactions with dates, merchants, amounts (as numbers), categories, and type (debit/credit). Identify wasteful spending, anomalies, duplicates, and subscriptions. Provide actionable recommendations.

Return ONLY the JSON object, nothing else."""
        
        return prompt
    
    def _extract_json_from_response(self, response_text: str) -> Dict:
        """
        Extract JSON from Gemini response, handling markdown code blocks.
        
        Args:
            response_text: Raw response from Gemini
            
        Returns:
            Parsed JSON dictionary
        """
        # Clean the response text
        text = response_text.strip()
        
        # Try to find JSON in markdown code blocks first
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find JSON directly (remove any text before/after)
            json_match = re.search(r'(\{.*\})', text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Last resort - try the entire text
                json_str = text
        
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
            logger.error(f"Response text (first 1000 chars): {text[:1000]}")
            
            # Try to extract JSON more aggressively
            try:
                # Find the first { and last }
                start = text.find('{')
                end = text.rfind('}')
                if start != -1 and end != -1:
                    json_str = text[start:end+1]
                    return json.loads(json_str)
            except:
                pass
            
            raise ValueError(f"Invalid JSON in Gemini response: {e}")
    
    async def analyze_statement(self, statement_text: str) -> AnalyzeStatementResponse:
        """
        Analyze bank statement using Gemini AI.
        
        Args:
            statement_text: Raw or cleaned bank statement text
            
        Returns:
            Complete analysis response with transactions and insights
        """
        logger.info(f"Analyzing bank statement with Gemini AI (text length: {len(statement_text)})")
        
        try:
            # Build prompt
            prompt = self._build_analysis_prompt(statement_text)
            
            # Generate analysis
            logger.info("Sending request to Gemini API...")
            response = self.model.generate_content(prompt)
            
            if not response or not response.text:
                raise ValueError("Empty response from Gemini API")
            
            logger.info(f"Received response from Gemini (length: {len(response.text)})")
            logger.debug(f"Response preview: {response.text[:500]}...")
            
            # Extract and parse JSON
            analysis_data = self._extract_json_from_response(response.text)
            
            # Validate and structure response
            summary_data = analysis_data.get("summary", {})
            summary = AnalysisSummary(
                total_spend=float(summary_data.get("total_spend", 0)),
                total_income=float(summary_data.get("total_income", 0)),
                top_category=summary_data.get("top_category", "Unknown"),
                top_merchant=summary_data.get("top_merchant", "Unknown"),
                wasteful_spending=summary_data.get("wasteful_spending", []),
                monthly_summary=summary_data.get("monthly_summary", {}),
                category_breakdown=summary_data.get("category_breakdown", {}),
            )
            
            # Parse transactions
            transactions = []
            for txn_data in analysis_data.get("transactions", []):
                try:
                    transaction = BankTransaction(
                        date=txn_data.get("date"),
                        merchant=txn_data.get("merchant", "Unknown"),
                        amount=float(txn_data.get("amount", 0)),
                        category=txn_data.get("category", "Other"),
                        type=txn_data.get("type", "debit"),
                    )
                    transactions.append(transaction)
                except Exception as e:
                    logger.warning(f"Failed to parse transaction: {e}")
                    continue
            
            # Build final response
            result = AnalyzeStatementResponse(
                summary=summary,
                transactions=transactions,
                anomalies=analysis_data.get("anomalies", []),
                recommendations=analysis_data.get("recommendations", []),
                subscriptions_detected=analysis_data.get("subscriptions_detected", []),
                duplicate_charges=analysis_data.get("duplicate_charges", []),
            )
            
            logger.info(f"Analysis complete: {len(transactions)} transactions, {len(result.anomalies)} anomalies")
            return result
            
        except Exception as e:
            logger.error(f"Gemini AI analysis failed: {e}")
            raise RuntimeError(f"Failed to analyze statement with Gemini AI: {e}")
    
    def test_connection(self) -> bool:
        """
        Test Gemini API connection.
        
        Returns:
            True if connection is successful
        """
        try:
            response = self.model.generate_content("Hello, respond with 'OK'")
            return response and response.text and "OK" in response.text.upper()
        except Exception as e:
            logger.error(f"Gemini API connection test failed: {e}")
            return False


# Singleton instance (will be initialized when needed)
_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    """Get or create Gemini service singleton."""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
