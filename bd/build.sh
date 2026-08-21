#!/bin/bash
# Build script for Render deployment

set -e  # Exit on error

echo "Starting build process..."
echo "Python version: $(python --version)"
echo "Pip version: $(pip --version)"

# Upgrade pip, setuptools, and wheel
echo "Upgrading pip, setuptools, and wheel..."
pip install --upgrade pip setuptools wheel

# Install dependencies
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

echo "✓ Build completed successfully!"
