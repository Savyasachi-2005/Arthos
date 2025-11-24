# Arthos - UPI Spend Analyzer

A complete full-stack application for analyzing UPI transaction messages and gaining insights into spending patterns.

## 🚀 Features

- **SMS Parsing**: Parse UPI transaction messages from various banks and payment apps
- **Category Mapping**: Automatically categorize transactions (Food, Shopping, Transport, etc.)
- **Spend Analytics**: View total spend, transaction count, and top categories
- **Visual Insights**: Interactive charts showing category breakdowns
- **Transaction History**: Detailed table of all parsed transactions
- **Persistent Storage**: SQLite database for transaction history
- **Modern UI**: Clean, responsive design with TailwindCSS

## 🏗️ Architecture

### Backend (FastAPI + SQLModel + SQLite)
- **API Endpoints**:
  - `POST /upi/analyze` - Analyze raw SMS messages
  - `GET /upi/transactions` - Retrieve all transactions
  - `GET /health` - Health check endpoint
- **Services**:
  - UPI Parser with regex pattern matching
  - Category mapper with keyword-based classification
  - Summary builder for analytics
- **Testing**: 43 comprehensive tests (26 parser + 17 API)

### Frontend (React + TypeScript + TailwindCSS)
- **Pages**:
  - UPI Analyzer - Main analysis interface
  - Dashboard - Overview of all transactions
- **Components**:
  - Reusable UI components (Button, Card, TextArea)
  - UPI-specific components (Input, Summary, Chart, Table)
- **State Management**: React Query for server state
- **API Integration**: Axios with interceptors

## 📋 Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **npm**: 9 or higher

## 🛠️ Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```powershell
cd g:\hackathon\Arthos\bd
```

2. Create and activate virtual environment:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

3. Install dependencies:
```powershell
pip install -r requirements.txt
```

4. Run tests (optional):
```powershell
pytest
```

5. Start the backend server:
```powershell
uvicorn app.main:app --reload
```

Backend will run on: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```powershell
cd a:\Arthos\fd
```

2. Install dependencies:
```powershell
npm install
```

3. Start the development server:
```powershell
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 🎯 Usage

### Web Interface

1. Open `http://localhost:5173` in your browser
2. Paste your UPI transaction SMS messages in the text area
3. Click "Analyze Transactions"
4. View your spending summary, category breakdown, and transaction details

### Example Messages

```
Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345
Your a/c XX1234 was debited by INR 219.00 for UPI payment to OLA CABS on 2025-11-20.
Payment of ₹1,299 to Amazon was successful on 19/11/2025
INR 499.00 paid to Netflix. Next billing date 01-12-2025
```

### API Usage (PowerShell)

```powershell
# Analyze transactions
$body = @{
    raw_text = @"
Rs. 249.00 paid to Zomato on 20-11-2025
INR 219.00 paid to OLA CABS on 20-11-2025
"@
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/upi/analyze" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Get all transactions
Invoke-RestMethod -Uri "http://localhost:8000/upi/transactions" -Method GET
```

## 📊 Supported Categories

- 🍔 **Food & Dining** - Restaurants, food delivery
- 🛒 **Shopping** - E-commerce, retail purchases
- 🚗 **Transport** - Cabs, fuel, parking
- 💊 **Healthcare** - Medicines, hospitals, doctors
- 💰 **Bills & Utilities** - Electricity, water, phone
- 🎬 **Entertainment** - Movies, streaming services
- 📚 **Education** - Courses, books, tuition
- ✈️ **Travel** - Hotels, flights, bookings
- 🔧 **Others** - Miscellaneous transactions

## 🧪 Testing

### Backend Tests
```powershell
cd g:\hackathon\Arthos\bd
pytest --cov=app tests/
```

### Frontend Tests (if implemented)
```powershell
cd g:\hackathon\Arthos\fd
npm test
```

## 📁 Project Structure

```
Arthos/
├── bd/                          # Backend
│   ├── app/
│   │   ├── main.py             # FastAPI application
│   │   ├── database.py         # Database configuration
│   │   ├── models.py           # SQLModel models
│   │   ├── schemas.py          # Pydantic schemas
│   │   ├── routers/
│   │   │   └── upi.py          # UPI endpoints
│   │   ├── services/
│   │   │   ├── upi_parser.py   # SMS parsing logic
│   │   │   ├── category_mapper.py
│   │   │   └── summary_builder.py
│   │   └── utils/
│   │       └── regex_patterns.py
│   ├── tests/
│   │   ├── test_parser.py      # Parser unit tests
│   │   └── test_api.py         # API integration tests
│   └── requirements.txt
│
└── fd/                          # Frontend
    ├── src/
    │   ├── api/
    │   │   ├── client.ts       # Axios instance
    │   │   └── upi.ts          # API functions
    │   ├── components/
    │   │   ├── ui/             # Reusable components
    │   │   └── upi/            # UPI-specific components
    │   ├── hooks/
    │   │   ├── useAnalyzeUpi.ts
    │   │   └── useTransactions.ts
    │   ├── pages/
    │   │   ├── UpiAnalyzer.tsx
    │   │   └── Dashboard.tsx
    │   ├── types/
    │   │   └── index.d.ts      # TypeScript types
    │   ├── utils/
    │   │   ├── format.ts       # Formatting utilities
    │   │   └── validators.ts   # Validation functions
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── tailwind.config.js
```

## 🔧 Configuration

### Backend Environment Variables (optional)
Create `.env` file in `bd/` directory:
```env
DATABASE_URL=sqlite:///./arthos.db
CORS_ORIGINS=http://localhost:5173
```

### Frontend Environment Variables (optional)
Create `.env` file in `fd/` directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🚀 Production Deployment

### Backend
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```powershell
npm run build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request



