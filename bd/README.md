# Arthos - UPI Spend Analyzer

**Backend Service for Parsing and Analyzing UPI/SMS Transaction Messages**

A production-ready FastAPI backend that parses UPI payment messages from SMS/bank notifications, automatically categorizes transactions, and provides comprehensive spending analytics. Built for a 24-hour hackathon with clean architecture and full test coverage.

## 🚀 Features

- **Smart Message Parsing**: Extracts transaction details (amount, merchant, date) from various Indian SMS/bank message formats
- **Automatic Categorization**: Keyword-based categorization into Food, Travel, Bills, Shopping, Groceries, Entertainment, Education, Health, and Others
- **Analytics Dashboard**: Provides spending summaries, category breakdowns, and top spending categories
- **SQLite Persistence**: Stores all transactions locally with easy migration path to PostgreSQL
- **RESTful API**: Clean JSON APIs ready for any frontend integration
- **CORS Enabled**: Pre-configured for frontend development
- **Comprehensive Tests**: Unit tests and API integration tests with pytest
- **Docker Ready**: Includes Dockerfile for containerized deployment

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app with startup/shutdown
│   ├── database.py             # Database engine and session management
│   ├── models.py               # SQLModel Transaction model
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── routers/
│   │   └── upi.py              # UPI analysis endpoints
│   ├── services/
│   │   ├── upi_parser.py       # Message parsing logic
│   │   ├── category_mapper.py  # Transaction categorization
│   │   └── summary_builder.py  # Analytics builder
│   └── utils/
│       └── regex_patterns.py   # Regex patterns for parsing
├── tests/
│   ├── test_parser.py          # Parser unit tests
│   └── test_api.py             # API integration tests
├── requirements.txt
├── Dockerfile
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

### Local Development Setup

1. **Clone or navigate to the backend directory**
   ```powershell
   cd g:\hackathon\Arthos\bd
   ```

2. **Create and activate virtual environment**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```powershell
   uvicorn app.main:app --reload
   ```

   The API will be available at: `http://127.0.0.1:8000`

5. **Access API Documentation**
   - Swagger UI: `http://127.0.0.1:8000/docs`
   - ReDoc: `http://127.0.0.1:8000/redoc`

## 🐳 Docker Deployment

### Build and run with Docker

```powershell
# Build the Docker image
docker build -t arthos-backend .

# Run the container
docker run -d -p 8000:8000 --name arthos arthos-backend

# View logs
docker logs -f arthos
```

## 🧪 Running Tests

```powershell
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_parser.py

# Run with coverage report
pytest --cov=app tests/
```

## 📡 API Endpoints

### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok"
}
```

### 2. Analyze UPI Messages
```http
POST /upi/analyze
Content-Type: application/json
```

**Request Body:**
```json
{
  "raw_text": "Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345\nINR 219 paid to OLA CABS on 20-11-2025."
}
```

**Response:**
```json
{
  "summary": {
    "total_spend": 468.00,
    "transaction_count": 2,
    "top_category": "Food"
  },
  "categories": {
    "Food": 249.00,
    "Travel": 219.00
  },
  "transactions": [
    {
      "id": "uuid-here",
      "merchant": "Zomato",
      "amount": 249.00,
      "category": "Food",
      "timestamp": "2025-11-20T00:00:00",
      "raw_text": "Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345"
    },
    {
      "id": "uuid-here",
      "merchant": "OLA CABS",
      "amount": 219.00,
      "category": "Travel",
      "timestamp": "2025-11-20T00:00:00",
      "raw_text": "INR 219 paid to OLA CABS on 20-11-2025."
    }
  ]
}
```

### 3. Get Transaction History
```http
GET /upi/transactions?limit=50&offset=0&category=Food
```

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 50, max: 500)
- `offset` (optional): Number of transactions to skip (default: 0)
- `category` (optional): Filter by category name

**Response:**
```json
{
  "transactions": [...],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

## 📝 Example Usage with curl

### Analyze Single Transaction
```powershell
curl -X POST "http://127.0.0.1:8000/upi/analyze" `
  -H "Content-Type: application/json" `
  -d '{"raw_text":"Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345"}'
```

### Analyze Multiple Transactions
```powershell
curl -X POST "http://127.0.0.1:8000/upi/analyze" `
  -H "Content-Type: application/json" `
  -d '{"raw_text":"Rs. 249.00 paid to Zomato on 20-11-2025.\nINR 219 paid to OLA CABS on 20-11-2025.\nPayment of ₹1,299 to Amazon was successful on 19/11/2025\nINR 499.00 paid to Netflix. Next billing date 01-12-2025"}'
```

### Get All Transactions
```powershell
curl "http://127.0.0.1:8000/upi/transactions"
```

### Get Transactions by Category
```powershell
curl "http://127.0.0.1:8000/upi/transactions?category=Food&limit=10"
```

## 📋 Supported SMS Formats

The parser supports various Indian bank and UPI message formats:

### Amount Formats
- `Rs. 249.00` / `Rs 249` / `Rs.249`
- `INR 219.00` / `INR 219`
- `₹1,299` / `₹1299.50`
- `debited by INR 500`
- `Payment of Rs. 100`

### Date Formats
- `DD-MM-YYYY` (e.g., 20-11-2025)
- `DD/MM/YYYY` (e.g., 19/11/2025)
- `DD Mon YYYY` (e.g., 20 Nov 2025)
- `YYYY-MM-DD` (e.g., 2025-11-20)

### Merchant Extraction
- "paid to [Merchant]"
- "payment to [Merchant]"
- "UPI payment to [Merchant]"
- "at [Merchant]"

## 🏷️ Transaction Categories

The system automatically categorizes transactions into:

- **Food**: Zomato, Swiggy, restaurants, cafes
- **Travel**: Ola, Uber, IRCTC, flights, hotels
- **Bills**: Electricity, mobile recharge, broadband
- **Shopping**: Amazon, Flipkart, Myntra
- **Groceries**: BigBasket, DMart, Blinkit
- **Entertainment**: Netflix, Prime Video, movies
- **Education**: Udemy, Coursera, BYJU'S
- **Health**: Hospitals, pharmacies, gyms
- **Others**: Unmatched transactions

## 🔧 Configuration

### Database Configuration
By default, the application uses SQLite with the database file at `./backend.db`. To switch to PostgreSQL:

1. Update `DATABASE_URL` in `app/database.py`:
   ```python
   DATABASE_URL = "postgresql://user:password@localhost/arthos"
   ```

2. Install PostgreSQL driver:
   ```powershell
   pip install psycopg2-binary
   ```

### Logging
Logging is configured in `app/main.py`. Adjust the log level as needed:
```python
logging.basicConfig(level=logging.INFO)  # Change to DEBUG for verbose output
```

## 🧩 Architecture Highlights

- **Clean Architecture**: Separation of concerns with routers, services, and data layers
- **Type Safety**: Full type hints using Pydantic and SQLModel
- **Dependency Injection**: FastAPI's dependency system for database sessions
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Input Validation**: Automatic validation with Pydantic schemas
- **Testing**: Isolated tests with in-memory SQLite databases

## 🚀 Future Enhancements

- [ ] Add `/metrics` endpoint for time-based analytics (last 30 days)
- [ ] Implement rate limiting middleware
- [ ] Add user authentication and multi-user support
- [ ] Support for recurring transaction detection
- [ ] Export functionality (CSV, PDF reports)
- [ ] Machine learning-based merchant name normalization
- [ ] Real-time SMS integration via webhooks

## 📄 License

This project is built for the hackathon and is open for educational purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `pytest`
5. Submit a pull request

## 💡 Tips for Frontend Integration

- API automatically handles CORS for all origins in development
- All endpoints return consistent JSON responses
- Transaction IDs are UUIDs for unique identification
- Timestamps are in ISO 8601 format
- Use the `/docs` endpoint to explore the API interactively

## 📞 Support

For issues or questions, please refer to the API documentation at `/docs` when the server is running.

---

**Built with ❤️ for the Arthos Hackathon**
