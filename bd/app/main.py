"""
Arthos - UPI Spend Analyzer
FastAPI backend service for parsing and analyzing UPI/SMS transaction messages.
"""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_db
from app.routers import upi, subscriptions, bank, auth
from app.schemas import HealthResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    logger.info("Starting Arthos UPI Spend Analyzer...")
    create_db()
    logger.info("Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Arthos UPI Spend Analyzer...")


# Create FastAPI app
app = FastAPI(
    title="Arthos - UPI Spend Analyzer",
    description="Backend service for parsing UPI/SMS messages and analyzing spending patterns",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS - support both development and production
# Get allowed origins from environment variable or use defaults
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    # Production: Use specific origins from environment variable
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    # Development: Allow localhost and common development URLs
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"  # Allow all in development (remove in production)
    ]

logger.info(f"CORS allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(upi.router, prefix="/api")
app.include_router(subscriptions.router, prefix="/api")
app.include_router(bank.router, prefix="/api")


@app.get("/", tags=["Root"])
@app.head("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Arthos - UPI Spend Analyzer",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
@app.head("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok")
