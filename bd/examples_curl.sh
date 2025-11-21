# Example curl commands for testing the API
# For use with real curl (not PowerShell's Invoke-WebRequest alias)
# Install curl from: https://curl.se/windows/ or use Git Bash

echo "=== Arthos UPI Spend Analyzer - curl Examples ==="
echo ""

BASE_URL="http://127.0.0.1:8000"

# 1. Health Check
echo "1. Health Check"
curl -s "$BASE_URL/health" | jq '.'
echo ""

# 2. Analyze Single Transaction
echo "2. Analyze Single Transaction (Zomato)"
curl -s -X POST "$BASE_URL/upi/analyze" \
  -H "Content-Type: application/json" \
  -d '{"raw_text":"Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345"}' | jq '.'
echo ""

# 3. Analyze Multiple Transactions
echo "3. Analyze Multiple Transactions"
curl -s -X POST "$BASE_URL/upi/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345\nYour a/c XX1234 was debited by INR 219.00 for UPI payment to OLA CABS on 2025-11-20.\nPayment of ₹1,299 to Amazon was successful on 19/11/2025\nINR 499.00 paid to Netflix. Next billing date 01-12-2025"
  }' | jq '.'
echo ""

# 4. Get All Transactions
echo "4. Get All Transactions"
curl -s "$BASE_URL/upi/transactions" | jq '.'
echo ""

# 5. Get Transactions with Limit
echo "5. Get Limited Transactions (limit=2)"
curl -s "$BASE_URL/upi/transactions?limit=2" | jq '.'
echo ""

# 6. Get Transactions by Category
echo "6. Get Food Category Transactions"
curl -s "$BASE_URL/upi/transactions?category=Food" | jq '.'
echo ""

# 7. Analyze with Various SMS Formats
echo "7. Test Different SMS Formats"
curl -s -X POST "$BASE_URL/upi/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "INR 150 debited from your account at BigBasket\nRs 500.50 paid to Swiggy on 21/11/2025\n₹299 payment to Spotify successful"
  }' | jq '.'
echo ""

echo "=== Examples Complete ==="
