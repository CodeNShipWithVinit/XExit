#!/bin/bash

echo "======================================"
echo "Resignation Management System Setup"
echo "======================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Setup backend
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..

echo ""

# Setup frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo ""
echo "======================================"
echo "✅ Setup completed successfully!"
echo "======================================"
echo ""
echo "⚠️  IMPORTANT: Before running the application:"
echo ""
echo "1. Get a Calendarific API key from https://calendarific.com/"
echo "2. Update backend/.env file with your API key and email settings"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm start"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Default login credentials:"
echo "  HR:       admin / admin"
echo "  Employee: john.doe / password123"
echo ""
