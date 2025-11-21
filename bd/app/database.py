"""
Database configuration and session management.
Uses SQLite by default with easy migration path to PostgreSQL.
"""
import logging
from typing import Generator

from sqlmodel import Session, SQLModel, create_engine

logger = logging.getLogger(__name__)

# SQLite database URL - change to PostgreSQL when needed
DATABASE_URL = "sqlite:///./backend.db"

# Create engine with check_same_thread=False for SQLite
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)


def create_db() -> None:
    """
    Create all database tables.
    Called at application startup.
    """
    logger.info("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    logger.info("Database tables created successfully")


def get_session() -> Generator[Session, None, None]:
    """
    Dependency that yields a database session.
    Used in FastAPI route dependencies for DB access.
    """
    with Session(engine) as session:
        yield session
