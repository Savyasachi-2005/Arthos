#!/bin/bash
# Build script for Render deployment

# Set environment variables for Rust toolchain
export CARGO_HOME=/opt/render/project/.cargo
export RUSTUP_HOME=/opt/render/project/.rustup
mkdir -p $CARGO_HOME
mkdir -p $RUSTUP_HOME

# Upgrade pip to latest version
pip install --upgrade pip

# Install packages with binary wheels only (no compilation)
pip install --only-binary :all: -r requirements.txt || {
    echo "Failed to install with binary wheels only, trying with fallback..."
    # Fallback: Install specific packages that have wheels first
    pip install --only-binary :all: fastapi==0.109.2 uvicorn[standard]==0.27.1 || exit 1
    pip install --only-binary :all: pydantic-core pydantic==2.6.4 || exit 1
    pip install --only-binary :all: sqlmodel sqlalchemy psycopg2-binary || exit 1
    pip install -r requirements.txt
}

echo "Build completed successfully!"
