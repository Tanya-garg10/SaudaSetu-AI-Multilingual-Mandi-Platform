@echo off
REM SaudaSetu AI Setup Script for Windows

echo 🚀 Setting up SaudaSetu AI Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Check if MongoDB is installed
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB is not installed. Please install MongoDB and try again.
    echo Visit: https://docs.mongodb.com/manual/installation/
    echo Or use MongoDB Atlas for cloud database.
)

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Setup backend
echo 🔧 Setting up backend...
cd backend

REM Install backend dependencies
call npm install

REM Copy environment file
if not exist .env (
    copy .env.example .env
    echo 📝 Created backend/.env file. Please update with your configuration.
)

REM Build backend
call npm run build

cd ..

REM Setup frontend
echo 🎨 Setting up frontend...
cd frontend

REM Install frontend dependencies
call npm install

REM Copy environment file
if not exist .env (
    copy .env.example .env
    echo 📝 Created frontend/.env file. Please update with your configuration.
)

REM Build frontend
call npm run build

cd ..

REM Setup shared types
echo 🔗 Setting up shared types...
cd shared
call npm install
cd ..

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist logs mkdir logs
if not exist uploads mkdir uploads
if not exist temp mkdir temp

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update backend/.env with your MongoDB connection string
echo 2. Update frontend/.env with your API URLs
echo 3. Start MongoDB service
echo 4. Run 'npm run dev' to start the development servers
echo.
echo 🔧 Available commands:
echo   npm run dev          - Start both frontend and backend in development mode
echo   npm run dev:backend  - Start only backend server
echo   npm run dev:frontend - Start only frontend server
echo   npm run build        - Build both frontend and backend for production
echo.
echo 📚 Documentation:
echo   docs/API.md              - API documentation
echo   docs/FEATURES.md         - Feature overview
echo   docs/NEGOTIATION_ENGINE.md - Negotiation engine details
echo.
echo 🌐 Default URLs:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo   API:      http://localhost:3000/api
echo.
echo Happy coding! 🚀
pause