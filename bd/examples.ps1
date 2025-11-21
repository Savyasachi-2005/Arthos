# Example curl commands for testing the API
# Save this file and run the commands in PowerShell or a terminal

Write-Host "=== Arthos UPI Spend Analyzer - API Examples ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://127.0.0.1:8000"

# 1. Health Check
Write-Host "1. Health Check" -ForegroundColor Yellow
Write-Host "Command: Invoke-RestMethod -Uri '$baseUrl/health'" -ForegroundColor Gray
$response = Invoke-RestMethod -Uri "$baseUrl/health"
$response | ConvertTo-Json
Write-Host ""

# 2. Analyze Single Transaction
Write-Host "2. Analyze Single Transaction (Zomato)" -ForegroundColor Yellow
$singleTxn = @{
    raw_text = "Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345"
} | ConvertTo-Json

Write-Host "Command: Invoke-RestMethod -Method Post -Uri '$baseUrl/upi/analyze' -ContentType 'application/json' -Body <json>" -ForegroundColor Gray
$response = Invoke-RestMethod -Method Post -Uri "$baseUrl/upi/analyze" -ContentType "application/json" -Body $singleTxn
$response | ConvertTo-Json -Depth 10
Write-Host ""

# 3. Analyze Multiple Transactions
Write-Host "3. Analyze Multiple Transactions" -ForegroundColor Yellow
# Using actual newlines (line breaks) in the string
$multiText = @"
Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345
Your a/c XX1234 was debited by INR 219.00 for UPI payment to OLA CABS on 2025-11-20.
Payment of Rs 1,299 to Amazon was successful on 19/11/2025
INR 499.00 paid to Netflix. Next billing date 01-12-2025
"@
$multiTxnBody = @{ raw_text = $multiText } | ConvertTo-Json

Write-Host "Command: Invoke-RestMethod -Method Post (with 4 transactions)" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Method Post -Uri "$baseUrl/upi/analyze" -ContentType "application/json" -Body $multiTxnBody
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4. Get All Transactions
Write-Host "4. Get All Transactions" -ForegroundColor Yellow
Write-Host "Command: Invoke-RestMethod -Uri '$baseUrl/upi/transactions'" -ForegroundColor Gray
$response = Invoke-RestMethod -Uri "$baseUrl/upi/transactions"
$response | ConvertTo-Json -Depth 10
Write-Host ""

# 5. Get Transactions with Limit
Write-Host "5. Get Limited Transactions (limit=2)" -ForegroundColor Yellow
Write-Host "Command: Invoke-RestMethod -Uri '$baseUrl/upi/transactions?limit=2'" -ForegroundColor Gray
$response = Invoke-RestMethod -Uri "$baseUrl/upi/transactions?limit=2"
$response | ConvertTo-Json -Depth 10
Write-Host ""

# 6. Get Transactions by Category
Write-Host "6. Get Food Category Transactions" -ForegroundColor Yellow
Write-Host "Command: Invoke-RestMethod -Uri '$baseUrl/upi/transactions?category=Food'" -ForegroundColor Gray
$response = Invoke-RestMethod -Uri "$baseUrl/upi/transactions?category=Food"
$response | ConvertTo-Json -Depth 10
Write-Host ""

Write-Host "=== Examples Complete ===" -ForegroundColor Green
