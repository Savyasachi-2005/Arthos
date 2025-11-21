"""
Database configuration and session management.
Uses SQLite by default with easy migration path to PostgreSQL.
"""
import logging
import os
from pathlib import Path
from typing import Generator

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

# Load environment variables from .env file in the app directory
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger(__name__)

# Get database URL from environment variable, fallback to SQLite
DATABASE_URL = os.getenv("database_url", "sqlite:///./backend.db")

# Log which database is being used (mask password for security)
if "postgresql" in DATABASE_URL:
    masked_url = DATABASE_URL.split("@")[1] if "@" in DATABASE_URL else DATABASE_URL
    logger.info(f"Using PostgreSQL database: {masked_url}")
else:
    logger.info(f"Using database: {DATABASE_URL}")

# Create engine with appropriate connection args
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}
elif "postgresql" in DATABASE_URL:
    # Add connection timeout and keepalive for PostgreSQL/Supabase
    connect_args = {
        "connect_timeout": 10,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }

engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    connect_args=connect_args,
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=3600,  # Recycle connections after 1 hour
)


def create_db() -> None:
    """
    Create all database tables.
    Called at application startup.
    """
    global engine, DATABASE_URL
    
    logger.info("Creating database tables...")
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        if "postgresql" in DATABASE_URL:
            logger.warning("PostgreSQL connection failed. Falling back to SQLite...")
            logger.error("PostgreSQL connection issues detected:")
            logger.error("  - Network/Firewall may be blocking Supabase")
            logger.error("  - DNS resolution failed")
            logger.error("  - Check: VPN, Firewall, or Supabase dashboard")
            
            # Fallback to SQLite
            DATABASE_URL = "sqlite:///./backend.db"
            engine = create_engine(
                DATABASE_URL,
                echo=False,
                connect_args={"check_same_thread": False}
            )
            logger.info("Retrying with SQLite...")
            SQLModel.metadata.create_all(engine)
            logger.info("SQLite database tables created successfully")
        else:
            raise


def get_session() -> Generator[Session, None, None]:
    """
    Dependency that yields a database session.
    Used in FastAPI route dependencies for DB access.
    """
    with Session(engine) as session:
        yield session
