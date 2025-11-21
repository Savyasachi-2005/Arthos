"""Integration tests for subscription management endpoints."""
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.database import get_session
from app.main import app


@pytest.fixture(name="session")
def session_fixture():
    """In-memory database session for subscriptions tests."""
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
    """FastAPI test client bound to the test session."""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


class TestSubscriptionCrud:
    """CRUD lifecycle tests."""

    def test_create_subscription(self, client: TestClient):
        payload = {
            "name": "Notion",
            "amount": 1200,
            "billing_cycle": "yearly",
            "renewal_date": date.today().isoformat(),
        }

        response = client.post("/subscriptions", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Notion"
        assert data["billing_cycle"] == "yearly"
        assert data["monthly_equivalent"] == pytest.approx(100.0)

    def test_list_with_filters(self, client: TestClient):
        today = date.today().isoformat()
        client.post(
            "/subscriptions",
            json={
                "name": "Spotify",
                "amount": 199,
                "billing_cycle": "monthly",
                "renewal_date": today,
            },
        )
        client.post(
            "/subscriptions",
            json={
                "name": "Adobe",
                "amount": 23988,
                "billing_cycle": "yearly",
                "renewal_date": today,
            },
        )

        response = client.get("/subscriptions?billing_cycle=monthly&max_amount=500")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["name"] == "Spotify"

    def test_update_subscription(self, client: TestClient):
        today = date.today().isoformat()
        create_resp = client.post(
            "/subscriptions",
            json={
                "name": "Canva",
                "amount": 999,
                "billing_cycle": "monthly",
                "renewal_date": today,
            },
        )
        sub_id = create_resp.json()["id"]

        update_resp = client.put(
            f"/subscriptions/{sub_id}",
            json={"amount": 1299, "billing_cycle": "yearly"},
        )
        assert update_resp.status_code == 200
        data = update_resp.json()
        assert data["amount"] == 1299
        assert data["billing_cycle"] == "yearly"
        assert data["monthly_equivalent"] == pytest.approx(108.25, rel=1e-2)

    def test_delete_subscription(self, client: TestClient):
        today = date.today().isoformat()
        create_resp = client.post(
            "/subscriptions",
            json={
                "name": "Figma",
                "amount": 1200,
                "billing_cycle": "monthly",
                "renewal_date": today,
            },
        )
        sub_id = create_resp.json()["id"]

        delete_resp = client.delete(f"/subscriptions/{sub_id}")
        assert delete_resp.status_code == 204

        list_resp = client.get("/subscriptions")
        assert list_resp.json()["total"] == 0


class TestSubscriptionSummary:
    """Summary endpoint coverage."""

    def test_summary_metrics_and_upcoming(self, client: TestClient):
        today = date.today()
        client.post(
            "/subscriptions",
            json={
                "name": "Netflix",
                "amount": 649,
                "billing_cycle": "monthly",
                "renewal_date": today.isoformat(),
            },
        )
        client.post(
            "/subscriptions",
            json={
                "name": "Apple One",
                "amount": 11988,
                "billing_cycle": "yearly",
                "renewal_date": (today + timedelta(days=5)).isoformat(),
            },
        )
        client.post(
            "/subscriptions",
            json={
                "name": "AWS",
                "amount": 24000,
                "billing_cycle": "yearly",
                "renewal_date": (today + timedelta(days=30)).isoformat(),
            },
        )

        summary_resp = client.get("/subscriptions/summary")
        assert summary_resp.status_code == 200
        summary = summary_resp.json()

        expected_monthly = 649 + (11988 / 12) + (24000 / 12)
        assert summary["monthly_burn"] == pytest.approx(round(expected_monthly, 2))
        assert summary["yearly_burn"] == pytest.approx(round(expected_monthly * 12, 2))
        assert len(summary["upcoming_renewals"]) == 2
        names = {item["name"] for item in summary["upcoming_renewals"]}
        assert "Netflix" in names
        assert "Apple One" in names
        assert all(item["days_left"] <= 7 for item in summary["upcoming_renewals"])
