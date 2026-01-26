#!/bin/bash

# SaudaSetu AI Setup Script for Unix/Linux/macOS

echo "🚀 Setting up SaudaSetu AI Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB and try again."
    echo "Visit: https://docs.mongodb.com/manual/installation/"
    echo "Or use MongoDB Atlas for cloud database."
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup backend
echo "🔧 Setting up backend..."
cd backend

# Install backend dependencies
npm install

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created backend/.env file. Please update with your configuration."
fi

# Build backend
npm run build

cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend

# Install frontend dependencies
npm install

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created frontend/.env file. Please update with your configuration."
fi

# Build frontend
npm run build

cd ..

# Setup shared types
echo "🔗 Setting up shared types..."
cd shared
npm install
cd ..

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p temp

# Set permissions
chmod +x scripts/setup.sh
chmod +x scripts/setup.bat

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your MongoDB connection string"
echo "2. Update frontend/.env with your API URLs"
echo "3. Start MongoDB service"
echo "4. Run 'npm run dev' to start the development servers"
echo ""
echo "🔧 Available commands:"
echo "  npm run dev          - Start both frontend and backend in development mode"
echo "  npm run dev:backend  - Start only backend server"
echo "  npm run dev:frontend - Start only frontend server"
echo "  npm run build        - Build both frontend and backend for production"
echo ""
echo "📚 Documentation:"
echo "  docs/API.md              - API documentation"
echo "  docs/FEATURES.md         - Feature overview"
echo "  docs/NEGOTIATION_ENGINE.md - Negotiation engine details"
echo ""
echo "🌐 Default URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000"
echo "  API:      http://localhost:3000/api"
echo ""
echo "Happy coding! 🚀"