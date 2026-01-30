# 🔧 SaudaSetu AI Backend - Dependencies Guide

## 📋 Production Dependencies

### **Core Framework & Server**
```json
{
  "express": "^4.22.1",           // Web application framework
  "mongoose": "^8.21.1",          // MongoDB object modeling
  "socket.io": "^4.8.3"           // Real-time bidirectional communication
}
```

### **Authentication & Security**
```json
{
  "jsonwebtoken": "^9.0.3",       // JWT token generation and verification
  "bcryptjs": "^2.4.3",           // Password hashing library
  "helmet": "^7.2.0",             // Security middleware for Express
  "cors": "^2.8.6",               // Cross-Origin Resource Sharing
  "express-rate-limit": "^7.5.1"  // Rate limiting middleware
}
```

### **Validation & Utilities**
```json
{
  "joi": "^17.13.3",              // Object schema validation
  "dotenv": "^16.6.1",            // Environment variables loader
  "axios": "^1.13.3",             // HTTP client for external APIs
  "node-cron": "^3.0.3"           // Task scheduler for Node.js
}
```

---

## 🛠️ Development Dependencies

### **TypeScript & Build Tools**
```json
{
  "typescript": "^5.9.3",         // TypeScript compiler
  "ts-node": "^10.9.2",           // TypeScript execution for Node.js
  "nodemon": "^3.1.11"            // Development server with auto-restart
}
```

### **Testing**
```json
{
  "jest": "^29.7.0"               // JavaScript testing framework
}
```

### **Type Definitions**
```json
{
  "@types/express": "^4.17.25",
  "@types/bcryptjs": "^2.4.6",
  "@types/cors": "^2.8.19",
  "@types/jsonwebtoken": "^9.0.10",
  "@types/node": "^20.19.30",
  "@types/jest": "^29.5.14"
}
```

---

## 🚀 Installation Commands

### **Install All Dependencies**
```bash
cd backend
npm install
```

### **Install Production Dependencies Only**
```bash
npm install --production
```

### **Install Specific Dependency**
```bash
npm install express@^4.22.1
```

---

## 📊 Dependency Usage

### **Express.js Framework**
- **Purpose**: Web server and API routes
- **Files**: `src/index.ts`, `src/routes/*.ts`
- **Features**: Middleware, routing, HTTP handling

### **Mongoose ODM**
- **Purpose**: MongoDB database operations
- **Files**: `src/models/*.ts`, `src/index.ts`
- **Features**: Schema definition, validation, queries

### **Socket.io**
- **Purpose**: Real-time communication
- **Files**: `src/socket/handlers.ts`, `src/index.ts`
- **Features**: WebSocket connections, real-time negotiations

### **JWT Authentication**
- **Purpose**: User authentication and authorization
- **Files**: `src/routes/auth.ts`, `src/middleware/auth.ts`
- **Features**: Token generation, verification, middleware

### **Bcrypt**
- **Purpose**: Password security
- **Files**: `src/models/User.ts`, `src/routes/auth.ts`
- **Features**: Password hashing, comparison

### **Joi Validation**
- **Purpose**: Input validation
- **Files**: `src/routes/*.ts`
- **Features**: Schema validation, error handling

---

## 🔧 Configuration Files

### **TypeScript Configuration**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### **Environment Variables**
```env
# .env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/saudasetu
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

---

## 🔄 Scripts

### **Development**
```bash
npm run dev          # Start development server with nodemon
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
npm test             # Run Jest tests
```

---

## 📦 Package Sizes

| Package | Size | Purpose |
|---------|------|---------|
| express | ~200KB | Web framework |
| mongoose | ~1.2MB | MongoDB ODM |
| socket.io | ~500KB | Real-time communication |
| jsonwebtoken | ~50KB | JWT handling |
| bcryptjs | ~100KB | Password hashing |
| joi | ~300KB | Validation |

**Total Production Bundle**: ~2.5MB

---

## 🔍 Security Dependencies

### **Helmet.js**
- Content Security Policy
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options

### **CORS**
- Cross-origin request handling
- Preflight request support
- Credential handling

### **Rate Limiting**
- Request throttling
- IP-based limiting
- Configurable windows

---

## 🚨 Critical Dependencies

### **Must Have for Production**
1. **express** - Core web framework
2. **mongoose** - Database connectivity
3. **jsonwebtoken** - Authentication
4. **bcryptjs** - Password security
5. **helmet** - Security headers
6. **cors** - Cross-origin support

### **Optional but Recommended**
1. **socket.io** - Real-time features
2. **joi** - Input validation
3. **express-rate-limit** - DDoS protection
4. **node-cron** - Scheduled tasks

---

## 🔄 Update Commands

### **Check for Updates**
```bash
npm outdated
```

### **Update All Dependencies**
```bash
npm update
```

### **Update Specific Package**
```bash
npm install express@latest
```

---

## 🐛 Troubleshooting

### **Common Issues**

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   ```

2. **TypeScript Compilation Error**
   ```bash
   # Clear build cache
   rm -rf dist/
   npm run build
   ```

3. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   ```

4. **Module Not Found**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

---

*Last Updated: January 2026*