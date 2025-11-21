"""
API integration tests for UPI analyzer endpoints.
Tests the FastAPI endpoints using TestClient.
"""
import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.database import get_session
from app.models import Transaction


# Create in-memory SQLite database for testing
@pytest.fixture(name="session")
def session_fixture():
    """Create a fresh database session for each test."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a test client with test database."""
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


class TestHealthEndpoint:
    """Tests for health check endpoint."""
    
    def test_health_check(self, client: TestClient):
        """Test health check returns OK."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestRootEndpoint:
    """Tests for root endpoint."""
    
    def test_root(self, client: TestClient):
        """Test root endpoint returns API info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert data["name"] == "Arthos - UPI Spend Analyzer"


class TestAnalyzeEndpoint:
    """Tests for /upi/analyze endpoint."""
    
    def test_analyze_single_transaction(self, client: TestClient, session: Session):
        """Test analyzing a single transaction message."""
        payload = {
            "raw_text": "Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345"
        }
        
        response = client.post("/upi/analyze", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check summary
        assert data["summary"]["total_spend"] == 249.00
        assert data["summary"]["transaction_count"] == 1
        assert data["summary"]["top_category"] == "Food"
        
        # Check categories
        assert "Food" in data["categories"]
        assert data["categories"]["Food"] == 249.00
        
        # Check transactions
        assert len(data["transactions"]) == 1
        transaction = data["transactions"][0]
        assert transaction["amount"] == 249.00
        assert transaction["merchant"] == "Zomato"
        assert transaction["category"] == "Food"
        
        # Verify persisted to database
        db_transactions = session.query(Transaction).all()
        assert len(db_transactions) == 1
    
    def test_analyze_multiple_transactions(self, client: TestClient, session: Session):
        """Test analyzing multiple transaction messages."""
        payload = {
            "raw_text": """Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345
INR 219 paid to OLA CABS on 20-11-2025.
Payment of ₹1,299 to Amazon was successful on 19/11/2025"""
        }
        
        response = client.post("/upi/analyze", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check summary
        expected_total = 249.00 + 219.00 + 1299.00
        assert data["summary"]["total_spend"] == expected_total
        assert data["summary"]["transaction_count"] == 3
        
        # Check transactions
        assert len(data["transactions"]) == 3
        
        # Verify categories are assigned
        categories = data["categories"]
        assert "Food" in categories  # Zomato
        assert "Travel" in categories  # OLA CABS
        assert "Shopping" in categories  # Amazon
        
        # Verify persisted to database
        db_transactions = session.query(Transaction).all()
        assert len(db_transactions) == 3
    
    def test_analyze_no_transactions(self, client: TestClient):
        """Test analyzing text with no valid transactions."""
        payload = {
            "raw_text": "This is just a random message with no transaction details"
        }
        
        response = client.post("/upi/analyze", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check empty response
        assert data["summary"]["total_spend"] == 0.0
        assert data["summary"]["transaction_count"] == 0
        assert data["summary"]["top_category"] is None
        assert len(data["transactions"]) == 0
        assert len(data["categories"]) == 0
    
    def test_analyze_missing_raw_text(self, client: TestClient):
        """Test analyzing with missing raw_text field."""
        payload = {}
        
        response = client.post("/upi/analyze", json=payload)
        assert response.status_code == 422  # Validation error
    
    def test_analyze_empty_raw_text(self, client: TestClient):
        """Test analyzing with empty raw_text."""
        payload = {"raw_text": ""}
        
        response = client.post("/upi/analyze", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["summary"]["transaction_count"] == 0
    
    def test_analyze_netflix_transaction(self, client: TestClient):
        """Test analyzing Netflix subscription message."""
        payload = {
            "raw_text": "INR 499.00 paid to Netflix. Next billing date 01-12-2025"
        }
        
        response = client.post("/upi/analyze", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        assert data["summary"]["total_spend"] == 499.00
        assert data["transactions"][0]["merchant"] == "Netflix"
        assert data["transactions"][0]["category"] == "Entertainment"
    
    def test_analyze_category_mapping(self, client: TestClient):
        """Test that categories are correctly mapped."""
        payload = {
            "raw_text": """Rs. 249.00 paid to Zomato on 20-11-2025
INR 219.00 paid to Uber on 20-11-2025
INR 499.00 paid to BigBasket on 20-11-2025"""
        }
        
        response = client.post("/upi/analyze", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify categories
        transactions = data["transactions"]
        categories = [t["category"] for t in transactions]
        
        assert "Food" in categories  # Zomato
        assert "Travel" in categories  # Uber
        assert "Groceries" in categories  # BigBasket


class TestTransactionsEndpoint:
    """Tests for /upi/transactions endpoint."""
    
    def test_get_transactions_empty(self, client: TestClient):
        """Test getting transactions from empty database."""
        response = client.get("/upi/transactions")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 0
        assert len(data["transactions"]) == 0
    
    def test_get_transactions_with_data(self, client: TestClient, session: Session):
        """Test getting transactions after adding some."""
        # First add some transactions
        payload = {
            "raw_text": """Rs. 249.00 paid to Zomato on 20-11-2025
INR 219.00 paid to OLA CABS on 20-11-2025"""
        }
        client.post("/upi/analyze", json=payload)
        
        # Now fetch transactions
        response = client.get("/upi/transactions")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 2
        assert len(data["transactions"]) == 2
    
    def test_get_transactions_with_limit(self, client: TestClient):
        """Test pagination with limit parameter."""
        # Add multiple transactions
        payload = {
            "raw_text": """Rs. 100 paid to Merchant1
Rs. 200 paid to Merchant2
Rs. 300 paid to Merchant3"""
        }
        client.post("/upi/analyze", json=payload)
        
        # Fetch with limit
        response = client.get("/upi/transactions?limit=2")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 3
        assert len(data["transactions"]) == 2
        assert data["limit"] == 2
    
    def test_get_transactions_with_offset(self, client: TestClient):
        """Test pagination with offset parameter."""
        # Add multiple transactions
        payload = {
            "raw_text": """Rs. 100 paid to Merchant1
Rs. 200 paid to Merchant2
Rs. 300 paid to Merchant3"""
        }
        client.post("/upi/analyze", json=payload)
        
        # Fetch with offset
        response = client.get("/upi/transactions?offset=1&limit=2")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 3
        assert len(data["transactions"]) == 2
        assert data["offset"] == 1
    
    def test_get_transactions_with_category_filter(self, client: TestClient):
        """Test filtering transactions by category."""
        # Add transactions with different categories
        payload = {
            "raw_text": """Rs. 249.00 paid to Zomato on 20-11-2025
INR 219.00 paid to OLA CABS on 20-11-2025"""
        }
        client.post("/upi/analyze", json=payload)
        
        # Fetch only Food category
        response = client.get("/upi/transactions?category=Food")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 1
        assert data["transactions"][0]["category"] == "Food"


class TestEndToEnd:
    """End-to-end integration tests."""
    
    def test_complete_workflow(self, client: TestClient):
        """Test complete workflow: analyze, then fetch transactions."""
        # Step 1: Analyze messages
        analyze_payload = {
            "raw_text": """Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345
Your a/c XX1234 was debited by INR 219.00 for UPI payment to OLA CABS on 2025-11-20.
Payment of ₹1,299 to Amazon was successful on 19/11/2025
INR 499.00 paid to Netflix. Next billing date 01-12-2025"""
        }
        
        analyze_response = client.post("/upi/analyze", json=analyze_payload)
        assert analyze_response.status_code == 200
        
        analyze_data = analyze_response.json()
        
        # Verify summary
        expected_total = 249.00 + 219.00 + 1299.00 + 499.00
        assert analyze_data["summary"]["total_spend"] == expected_total
        assert analyze_data["summary"]["transaction_count"] == 4
        
        # Step 2: Fetch all transactions
        transactions_response = client.get("/upi/transactions")
        assert transactions_response.status_code == 200
        
        transactions_data = transactions_response.json()
        assert transactions_data["total"] == 4
        
        # Verify all expected merchants are present
        merchants = [t["merchant"] for t in transactions_data["transactions"]]
        assert "Zomato" in merchants
        assert "OLA CABS" in merchants
        assert "Amazon" in merchants
        assert "Netflix" in merchants
