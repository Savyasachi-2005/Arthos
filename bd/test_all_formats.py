"""
Comprehensive test script to verify all UPI message formats
"""
from app.services.upi_parser import parse_message_line
from app.services.category_mapper import map_category

# Test messages covering various bank formats
test_messages = [
    # SBI formats
    "Dear UPI user A/C X1859 debited by 45.0 on date 05Nov25 trf to S I T Canteen Refno 567501164506",
    "Your UPI-Mandate for Rs.599.00 is successfully created towards STORYTV from A/c No: XXXXXX1859. UMN:f1b6ef8da90f4c3f9641a4e30d905e7e@ybl",
    
    # Canara Bank format
    "An amount of INR 120.00 has been DEBITED to your account XXX440 on 21/11/2025. Total Avail.bal INR 1,064.81.Dial 1930",
    
    # Standard formats
    "Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345",
    "Your a/c XX1234 was debited by INR 219.00 for UPI payment to OLA CABS on 2025-11-20.",
    "Payment of Rs 1,299 to Amazon was successful on 19/11/2025",
    "INR 499.00 paid to Netflix. Next billing date 01-12-2025",
    
    # Additional formats
    "₹850 paid to Swiggy on Nov 21, 2025",
    "Payment of 1500 to BigBasket completed successfully",
]

print("=" * 80)
print("COMPREHENSIVE UPI MESSAGE PARSER TEST")
print("=" * 80)
print()

for i, msg in enumerate(test_messages, 1):
    print(f"\n{i}. Testing Message:")
    print(f"   '{msg[:70]}{'...' if len(msg) > 70 else ''}'")
    print("-" * 80)
    
    result = parse_message_line(msg)
    
    if result:
        category = map_category(msg, result.merchant)
        print(f"   ✓ Amount:   ₹{result.amount}")
        print(f"   ✓ Merchant: {result.merchant}")
        print(f"   ✓ Date:     {result.timestamp}")
        print(f"   ✓ Category: {category}")
    else:
        print(f"   ✗ FAILED TO PARSE")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
