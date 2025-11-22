#!/bin/bash
# Build script for Render deployment

set -e  # Exit on error

echo "Starting build process..."

# Set environment variables for Rust toolchain (in case needed)
export CARGO_HOME=/opt/render/project/.cargo
export RUSTUP_HOME=/opt/render/project/.rustup
export CARGO_NET_GIT_FETCH_WITH_CLI=true
mkdir -p "$CARGO_HOME"
mkdir -p "$RUSTUP_HOME"

echo "Python version: $(python --version)"
echo "Pip version: $(pip --version)"

# Upgrade pip, setuptools, and wheel
echo "Upgrading pip, setuptools, and wheel..."
pip install --upgrade pip setuptools wheel

# Try to install with pre-built wheels only (faster and avoids compilation)
echo "Attempting to install dependencies with binary wheels only..."
if pip install --only-binary :all: -r requirements.txt 2>/dev/null; then
    echo "✓ Successfully installed all dependencies with binary wheels"
else
    echo "⚠ Some packages don't have binary wheels, installing with compilation fallback..."
    # Install packages that definitely have wheels first
    pip install --only-binary :all: fastapi uvicorn pydantic sqlalchemy psycopg2-binary 2>/dev/null || true
    
    # Then install everything else (allowing source builds if needed)
    pip install -r requirements.txt
fi

echo "✓ Build completed successfully!"
