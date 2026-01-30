# 🚀 SaudaSetu AI - Render.com Deployment Guide

## 📋 Prerequisites

1. **GitHub Repository** with your code
2. **Render.com Account** (free tier available)
3. **MongoDB Atlas** account (for database)

---

## 🔧 Backend Deployment on Render

### **Step 1: Create Web Service**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure service:

```yaml
Name: saudasetu-backend
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

### **Step 2: Environment Variables**
Add these environment variables in Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saudasetu
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### **Step 3: Auto-Deploy Settings**
- ✅ Auto-Deploy: Yes
- ✅ Build Command: `npm install && npm run build`
- ✅ Start Command: `npm start`

---

## 🎨 Frontend Deployment on Render

### **Step 1: Create Static Site**
1. Click "New" → "Static Site"
2. Connect same GitHub repository
3. Configure:

```yaml
Name: saudasetu-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

### **Step 2: Environment Variables**
```env
VITE_API_URL=https://saudasetu-backend.onrender.com/api
VITE_SOCKET_URL=https://saudasetu-backend.onrender.com
```

---

## 🗄️ Database Setup (MongoDB Atlas)

### **Step 1: Create Cluster**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for Render)

### **Step 2: Get Connection String**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
```

---

## 📁 File Structure for Render

```
project-root/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile (optional)
│   └── healthcheck.js
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── render.yaml (optional)
└── RENDER_DEPLOYMENT.md
```

---

## 🔧 Build Commands

### **Backend Build Process**
```bash
# Render will run these commands:
npm install                 # Install dependencies
npm run build              # Compile TypeScript
npm start                  # Start production server
```

### **Frontend Build Process**
```bash
# Render will run these commands:
npm install                # Install dependencies
npm run build             # Build with Vite
# Serve from dist/ directory
```

---

## 🌐 Custom Domains (Optional)

### **Backend Domain**
- Default: `https://saudasetu-backend.onrender.com`
- Custom: `https://api.saudasetu.com`

### **Frontend Domain**
- Default: `https://saudasetu-frontend.onrender.com`
- Custom: `https://saudasetu.com`

---

## 🔍 Monitoring & Logs

### **View Logs**
1. Go to service dashboard
2. Click "Logs" tab
3. Monitor real-time logs

### **Health Checks**
- Backend: `https://your-backend.onrender.com/health`
- Automatic health monitoring enabled

---

## 🚨 Common Issues & Solutions

### **1. Build Fails - Node Version**
```yaml
# Add to package.json
"engines": {
  "node": "18.x",
  "npm": "9.x"
}
```

### **2. Environment Variables Not Working**
- Check spelling in Render dashboard
- Restart service after adding variables
- Use `process.env.VARIABLE_NAME` in code

### **3. Database Connection Issues**
- Verify MongoDB Atlas connection string
- Check IP whitelist (use 0.0.0.0/0)
- Ensure database user has correct permissions

### **4. CORS Errors**
```javascript
// In backend/src/index.ts
app.use(cors({
  origin: [
    'https://saudasetu-frontend.onrender.com',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

### **5. Static Files Not Loading**
```javascript
// In frontend/vite.config.ts
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist'
  }
});
```

---

## 💰 Pricing

### **Free Tier Limits**
- **Web Services**: 750 hours/month
- **Static Sites**: Unlimited
- **Bandwidth**: 100GB/month
- **Build Minutes**: 500/month

### **Paid Plans**
- **Starter**: $7/month per service
- **Standard**: $25/month per service
- **Pro**: $85/month per service

---

## 🔄 Deployment Workflow

### **Automatic Deployment**
1. Push code to GitHub
2. Render detects changes
3. Builds and deploys automatically
4. Service restarts with new version

### **Manual Deployment**
1. Go to service dashboard
2. Click "Manual Deploy"
3. Select branch to deploy

---

## 📊 Performance Optimization

### **Backend Optimization**
- Use `NODE_ENV=production`
- Enable gzip compression
- Implement caching strategies
- Use connection pooling for MongoDB

### **Frontend Optimization**
- Enable build optimizations in Vite
- Use CDN for static assets
- Implement code splitting
- Optimize images and assets

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit secrets
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure proper origins
4. **Rate Limiting**: Implement API rate limiting
5. **JWT Secrets**: Use strong, unique secrets

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **Status**: https://status.render.com

---

*Happy Deploying! 🚀*