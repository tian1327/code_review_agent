#!/bin/bash

# LLM Agents for Automatic Code Review - Quick Start Script
# This script starts both the backend and frontend services

set -e  # Exit on any error

echo "🚀 Starting LLM Agents for Automatic Code Review..."
echo "=================================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $(pwd)"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first:"
    echo "   python3 -m venv venv"
    echo "   source venv/bin/activate"
    echo "   cd backend && pip install -r requirements.txt"
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Frontend dependencies not found. Please run:"
    echo "   cd frontend && npm install"
    exit 1
fi

# Add Homebrew to PATH
export PATH="/opt/homebrew/bin:$PATH"

echo "🔧 Starting Backend (FastAPI)..."
echo "   URL: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"

# Start backend in background
source venv/bin/activate
cd backend
python run.py &
BACKEND_PID=$!

echo "✅ Backend started with PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

echo ""
echo "🎨 Starting Frontend (React)..."
echo "   URL: http://localhost:3000"

# Start frontend in background
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ Frontend started with PID: $FRONTEND_PID"

echo ""
echo "🎉 Both services are starting up!"
echo "=================================="
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "⏳ Waiting for services to be ready..."

# Wait for services to be ready
sleep 10

# Check if services are running
echo ""
echo "🔍 Checking service status..."

if lsof -i :8000 > /dev/null 2>&1; then
    echo "✅ Backend is running on port 8000"
else
    echo "❌ Backend failed to start"
fi

if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on port 3000"
else
    echo "❌ Frontend failed to start"
fi

echo ""
echo "🎯 To stop the services, run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🌐 Open your browser and go to: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop this script (services will continue running)"

# Keep script running and handle Ctrl+C
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ Services stopped'; exit 0" INT

# Wait indefinitely
while true; do
    sleep 1
done 