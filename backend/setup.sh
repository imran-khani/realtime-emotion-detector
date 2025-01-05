#!/bin/bash

# Exit on error
set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🔧 Setting up Python development environment..."

# Check if python3-venv is installed
if ! dpkg -l | grep -q python3-venv; then
    echo "📦 Installing python3-venv..."
    sudo apt-get update
    sudo apt-get install -y python3-venv
fi

# Remove existing virtual environment if it exists
if [ -d "venv" ]; then
    echo "🗑️  Removing existing virtual environment..."
    rm -rf venv
fi

# Create new virtual environment
echo "🔨 Creating new virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "✨ Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
python3 -m pip install --upgrade pip

# Install requirements
echo "📚 Installing dependencies..."
python3 -m pip install -r requirements.txt

echo "✅ Setup completed successfully!"
echo "To activate the virtual environment, run: source venv/bin/activate" 