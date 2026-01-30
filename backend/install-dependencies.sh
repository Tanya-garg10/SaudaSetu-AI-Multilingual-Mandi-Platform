#!/bin/bash

# SaudaSetu AI Backend - Dependencies Installation Script
# This script installs all required Node.js dependencies for the backend

echo "🚀 Installing SaudaSetu AI Backend Dependencies..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install production dependencies
echo "📦 Installing production dependencies..."
npm install express@^4.22.1 \
           mongoose@^8.21.1 \
           socket.io@^4.8.3 \
           jsonwebtoken@^9.0.3 \
           bcryptjs@^2.4.3 \
           helmet@^7.2.0 \
           cors@^2.8.6 \
           express-rate-limit@^7.5.1 \
           joi@^17.13.3 \
           dotenv@^16.6.1 \
           axios@^1.13.3 \
           node-cron@^3.0.3

if [ $? -eq 0 ]; then
    echo "✅ Production dependencies installed successfully!"
else
    echo "❌ Failed to install production dependencies"
    exit 1
fi

echo ""

# Install development dependencies
echo "🛠️ Installing development dependencies..."
npm install -D typescript@^5.9.3 \
              ts-node@^10.9.2 \
              nodemon@^3.1.11 \
              jest@^29.7.0 \
              @types/express@^4.17.25 \
              @types/bcryptjs@^2.4.6 \
              @types/cors@^2.8.19 \
              @types/jsonwebtoken@^9.0.10 \
              @types/node@^20.19.30 \
              @types/jest@^29.5.14

if [ $? -eq 0 ]; then
    echo "✅ Development dependencies installed successfully!"
else
    echo "❌ Failed to install development dependencies"
    exit 1
fi

echo ""
echo "🎉 All dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.example to .env and configure your environment variables"
echo "2. Start MongoDB service"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "🔧 Available scripts:"
echo "  npm run dev    - Start development server"
echo "  npm run build  - Build TypeScript"
echo "  npm run start  - Start production server"
echo "  npm test       - Run tests"
echo ""
echo "Happy coding! 🚀"