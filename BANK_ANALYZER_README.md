# Bank Statement Analyzer - Setup Guide

## Overview
Complete AI-powered bank statement analysis feature using Gemini API, OCR, and FastAPI + React.

## Backend Setup

### 1. Install Dependencies
```bash
cd bd
pip install -r requirements.txt
```

### 2. Configure Gemini API Key
Add your Gemini API key to `bd/app/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 3. Install OCR Dependencies (Optional but Recommended)

#### For Tesseract (Faster, Recommended):
**Windows:**
- Download installer: https://github.com/UB-Mannheim/tesseract/wiki
- Install and add to PATH
- Install Python wrapper: `pip install pytesseract`

**Linux:**
```bash
sudo apt-get install tesseract-ocr
pip install pytesseract
```

**macOS:**
```bash
brew install tesseract
pip install pytesseract
```

#### For EasyOCR (Better Accuracy, Slower):
```bash
pip install easyocr
```

Note: At least one OCR engine (Tesseract or EasyOCR) should be installed for image processing.

### 4. Database Migration
The `BankAnalysis` table will be created automatically on server startup.

### 5. Start Backend Server
```bash
cd bd
uvicorn app.main:app --reload
```

Server will run at: http://127.0.0.1:8000

## Frontend Setup

### 1. Install Dependencies
```bash
cd fd
npm install
```

### 2. Install Required Chart Libraries
```bash
npm install recharts
```

### 3. Start Frontend Dev Server
```bash
npm run dev
```

Frontend will run at: http://localhost:5173

## Features Implemented

### Backend (FastAPI)
✅ **POST /bank/upload-statement**
- Accepts PDF, JPG, PNG, or raw text
- OCR extraction using Tesseract or EasyOCR
- PDF text extraction using pdfplumber or PyPDF2
- Returns cleaned text and transaction lines

✅ **POST /bank/analyze**
- Sends statement to Gemini AI for analysis
- Extracts transactions with categories
- Detects wasteful spending
- Identifies anomalies and duplicates
- Finds recurring subscriptions
- Generates personalized recommendations

✅ **GET /bank/history**
- Returns previously analyzed statements
- Pagination support

### Services
- `ocr_service.py` - OCR extraction from images
- `statement_cleaner.py` - Text preprocessing and cleaning
- `gemini_service.py` - AI analysis using Gemini API

### Database
- `BankAnalysis` model - Stores analysis results with full JSON

### Frontend (React + TypeScript)
✅ **BankAnalyzer Page** (`/bank-analyzer`)
- File upload (drag & drop)
- Text paste support
- Real-time analysis with loading states
- Beautiful visualizations

✅ **Components**
- `StatementUpload` - Upload interface
- `StatementPreview` - Extracted text preview
- `AnalysisSummaryCard` - Key metrics display
- `CategoryChart` - Pie chart for categories
- `MerchantBarChart` - Top merchants visualization
- `SpendSummaryCard` - Monthly trends

✅ **Features**
- Summary cards (Total Spend, Income, Net Balance, Top Category)
- Category breakdown pie chart
- Top merchants bar chart
- Monthly spending trends
- Wasteful spending detection
- Anomaly alerts
- Duplicate charge detection
- Subscription identification
- AI-powered recommendations
- Full transaction table

## Usage

1. Navigate to http://localhost:5173/bank-analyzer
2. Upload your bank statement (PDF/Image) or paste text
3. Click "Analyze with Gemini AI"
4. View comprehensive financial insights

## API Documentation
Once backend is running, visit:
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Gemini AI Prompt
The system uses a sophisticated prompt to:
- Extract all transactions with dates, merchants, amounts, categories
- Classify spending into predefined categories
- Identify wasteful/impulse spending patterns
- Detect duplicate charges and anomalies
- Find recurring subscriptions
- Generate actionable recommendations

## Categories Supported
Food, Shopping, Transport, Entertainment, Bills, Healthcare, Education, Investment, Transfer, Groceries, Online Shopping, Fuel, Dining, Subscriptions, Insurance, Rent, EMI, Other

## File Support
- **Images**: JPG, JPEG, PNG (via OCR)
- **Documents**: PDF (via text extraction)
- **Text**: Direct paste of statement text

## Error Handling
- Graceful fallback if OCR not available
- Error messages for failed uploads
- Retry logic for API failures
- Validation for empty or invalid statements

## Production Considerations
1. Set proper CORS origins in `main.py`
2. Add rate limiting for Gemini API calls
3. Implement file size limits
4. Add authentication/authorization
5. Use environment variables for all secrets
6. Enable database connection pooling
7. Add caching for frequently accessed data
8. Implement proper logging and monitoring

## Troubleshooting

### OCR Not Working
- Ensure Tesseract or EasyOCR is installed
- Check PATH configuration for Tesseract
- Try using raw text paste as fallback

### Gemini API Errors
- Verify API key is correct
- Check API quota/rate limits
- Ensure internet connectivity

### Database Connection Issues
- Verify Supabase connection string
- Check firewall/network settings
- Ensure database migrations ran successfully

## Next Steps
- Add bank statement templates recognition
- Implement multi-currency support
- Add export to CSV/Excel
- Create scheduled analysis reports
- Add spending goals and alerts
- Implement budget tracking
