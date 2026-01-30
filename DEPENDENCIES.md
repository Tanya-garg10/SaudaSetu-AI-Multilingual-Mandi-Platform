# 📦 SaudaSetu AI - Dependencies Guide

## 🚀 Quick Setup

### **Prerequisites**
- Node.js 18+ 
- npm 9+
- MongoDB 6+ (local or Atlas)
- Git

### **Installation Commands**
```bash
# Clone repository
git clone <repository-url>
cd saudasetu-ai

# Install all dependencies
npm run install:all

# Or install manually
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../shared && npm install
```

---

## 📋 Root Dependencies

### **Development Tools**
```json
{
  "concurrently": "^8.2.2"
}
```

---

## 🔧 Backend Dependencies

### **Core Framework**
- **express**: ^4.22.1 - Web framework
- **mongoose**: ^8.21.1 - MongoDB ODM
- **socket.io**: ^4.8.3 - Real-time communication

### **Authentication & Security**
- **jsonwebtoken**: ^9.0.3 - JWT tokens
- **bcryptjs**: ^2.4.3 - Password hashing
- **helmet**: ^7.2.0 - Security headers
- **cors**: ^2.8.6 - Cross-origin requests
- **express-rate-limit**: ^7.5.1 - Rate limiting

### **Validation & Utilities**
- **joi**: ^17.13.3 - Input validation
- **dotenv**: ^16.6.1 - Environment variables
- **axios**: ^1.13.3 - HTTP client
- **node-cron**: ^3.0.3 - Scheduled tasks

### **Development**
- **typescript**: ^5.9.3
- **ts-node**: ^10.9.2
- **nodemon**: ^3.1.11
- **jest**: ^29.7.0

---

## 🎨 Frontend Dependencies

### **Core Framework**
- **react**: ^18.3.1 - UI library
- **react-dom**: ^18.3.1 - DOM rendering
- **react-router-dom**: ^6.30.3 - Routing

### **State Management**
- **zustand**: ^5.0.10 - State management
- **react-query**: ^3.39.3 - Server state

### **UI & Styling**
- **tailwindcss**: ^3.4.19 - CSS framework
- **lucide-react**: ^0.294.0 - Icons
- **react-hot-toast**: ^2.6.0 - Notifications

### **Forms & Validation**
- **react-hook-form**: ^7.71.1 - Form handling

### **Communication**
- **axios**: ^1.13.3 - HTTP client
- **socket.io-client**: ^4.8.3 - WebSocket client

### **Development**
- **vite**: ^5.4.21 - Build tool
- **typescript**: ^5.9.3
- **eslint**: ^8.57.1

---

## 🔗 Shared Dependencies

### **Type Definitions**
- **typescript**: ^5.9.3 - Shared types

---

## 🌍 Environment Variables

### **Backend (.env)**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/saudasetu
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

---

## 🚀 Development Scripts

### **Root Level**
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both projects
npm run install:all      # Install all dependencies
```

### **Backend**
```bash
npm run dev              # Development server
npm run build            # Build TypeScript
npm run start            # Production server
npm test                 # Run tests
```

### **Frontend**
```bash
npm run dev              # Development server
npm run build            # Production build
npm run preview          # Preview build
npm run lint             # Lint code
```

---

## 📊 System Requirements

### **Minimum Requirements**
- **RAM**: 4GB
- **Storage**: 2GB free space
- **Node.js**: 16.x or higher
- **MongoDB**: 5.x or higher

### **Recommended Requirements**
- **RAM**: 8GB+
- **Storage**: 5GB+ free space
- **Node.js**: 18.x LTS
- **MongoDB**: 6.x or Atlas

---

## 🔧 Troubleshooting

### **Common Issues**

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   ```

2. **MongoDB Connection Error**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod
   ```

3. **Dependencies Installation Failed**
   ```bash
   # Clear cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript Compilation Errors**
   ```bash
   # Rebuild TypeScript
   npm run build
   ```

---

## 📱 Production Deployment

### **Vercel (Frontend)**
- Automatic deployment from GitHub
- Environment variables configured
- Build command: `npm run build:frontend`

### **Backend Deployment Options**
- **Railway**: Node.js + MongoDB
- **Heroku**: With MongoDB Atlas
- **DigitalOcean**: Droplet + MongoDB
- **AWS**: EC2 + DocumentDB

---

## 🔄 Version Compatibility

| Component | Version | Status |
|-----------|---------|--------|
| Node.js | 18.x LTS | ✅ Recommended |
| npm | 9.x+ | ✅ Required |
| MongoDB | 6.x+ | ✅ Recommended |
| TypeScript | 5.x | ✅ Current |
| React | 18.x | ✅ Latest |

---

*Last Updated: January 2026*