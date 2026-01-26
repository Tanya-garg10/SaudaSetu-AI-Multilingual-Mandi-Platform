# SaudaSetu AI 🛒🤖

**Revolutionizing Indian Local Markets with AI-Powered Intelligence**

SaudaSetu AI is a comprehensive platform that bridges the gap between traditional Indian local markets and modern technology. It enables seamless communication between buyers and vendors through real-time multilingual translation, AI-driven price discovery, and intelligent negotiation tools.

## 🌟 Key Features

### 🗣️ Real-time Multilingual Translation
- Support for 12 major Indian languages (Hindi, English, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese)
- Context-aware translation for market-specific terminology
- Auto-language detection

### 📊 AI-Driven Price Discovery
- Real-time market price analysis
- Historical trend analysis
- Location-based pricing insights
- Market trend predictions (rising/falling/stable)

### 🤝 Intelligent Negotiation Engine
- AI-powered fair price suggestions
- Market-based counter-offer recommendations
- Negotiation fairness analysis
- Cultural sensitivity in negotiations

### 💬 Real-time Communication
- WebSocket-powered instant messaging
- Live negotiation updates
- Typing indicators
- Message translation on-the-fly

### 📱 Responsive Dashboards
- **Buyer Dashboard**: Track negotiations, view market trends, manage purchases
- **Vendor Dashboard**: Manage products, track sales, analyze performance

## 🏗️ Architecture

### Frontend
- **React.js** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for state management
- **Socket.io Client** for real-time communication
- **React Router** for navigation

### Backend
- **Node.js** with Express and TypeScript
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time features
- **JWT** authentication
- **Joi** for validation

### AI Services
- **Translation Service** with support for Indian languages
- **Price Discovery Engine** with market analysis
- **Negotiation Intelligence** with fairness algorithms

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/saudasetu-ai.git
   cd saudasetu-ai
   ```

2. **Run setup script**
   
   **For Unix/Linux/macOS:**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```
   
   **For Windows:**
   ```cmd
   scripts\setup.bat
   ```

3. **Configure environment variables**
   
   **Backend (.env):**
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/saudasetu
   JWT_SECRET=your-super-secret-jwt-key-here
   FRONTEND_URL=http://localhost:5173
   ```
   
   **Frontend (.env):**
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_SOCKET_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000
   - API: http://localhost:3000/api

## 📖 Documentation

- [API Documentation](docs/API.md) - Complete API reference
- [Features Overview](docs/FEATURES.md) - Detailed feature descriptions
- [Negotiation Engine](docs/NEGOTIATION_ENGINE.md) - AI negotiation system details

## 🛠️ Development

### Project Structure
```
saudasetu-ai/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── socket/         # WebSocket handlers
│   │   └── middleware/     # Express middleware
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── stores/         # State management
│   │   └── styles/         # CSS styles
│   └── package.json
├── shared/                 # Shared TypeScript types
│   └── types/
├── docs/                   # Documentation
├── scripts/                # Setup scripts
└── package.json           # Root package.json
```

### Available Scripts

```bash
# Development
npm run dev                 # Start both frontend and backend
npm run dev:backend         # Start only backend
npm run dev:frontend        # Start only frontend

# Building
npm run build              # Build both frontend and backend
npm run build:backend      # Build only backend
npm run build:frontend     # Build only frontend

# Installation
npm run install:all        # Install all dependencies
```

### Key Technologies

#### Frontend Stack
- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Socket.io Client** - Real-time communication
- **Lucide React** - Beautiful icons

#### Backend Stack
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Joi** - Data validation
- **Helmet** - Security middleware

## 🌍 Supported Languages

- **Hindi (hi)** - हिंदी
- **English (en)** - English
- **Bengali (bn)** - বাংলা
- **Telugu (te)** - తెలుగు
- **Marathi (mr)** - मराठी
- **Tamil (ta)** - தமிழ்
- **Gujarati (gu)** - ગુજરાતી
- **Kannada (kn)** - ಕನ್ನಡ
- **Malayalam (ml)** - മലയാളം
- **Punjabi (pa)** - ਪੰਜਾਬੀ
- **Odia (or)** - ଓଡ଼ିଆ
- **Assamese (as)** - অসমীয়া

## 🛒 Product Categories

- **Vegetables** - Fresh vegetables
- **Fruits** - Fresh fruits
- **Grains** - Rice, wheat, etc.
- **Spices** - Indian spices
- **Dairy** - Milk products
- **Meat** - Fresh meat
- **Fish** - Fresh fish
- **Pulses** - Lentils and legumes
- **Oils** - Cooking oils
- **Others** - Miscellaneous items

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - API abuse protection
- **CORS Protection** - Cross-origin security
- **Input Validation** - Comprehensive data validation
- **Helmet Integration** - Security headers
- **Password Hashing** - bcrypt encryption

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saudasetu
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-domain.com
```

### Docker Support (Coming Soon)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📊 Performance

- **Real-time Updates** - Sub-second WebSocket communication
- **Optimized Queries** - Indexed MongoDB queries
- **Caching** - Intelligent caching for price data
- **Responsive Design** - Mobile-first approach

## 🔮 Future Roadmap

### Phase 1 (Current)
- ✅ Core platform functionality
- ✅ Real-time translation
- ✅ Price discovery engine
- ✅ Negotiation system

### Phase 2 (Q2 2024)
- 🔄 Payment integration
- 🔄 Advanced analytics
- 🔄 Mobile app
- 🔄 Vendor verification

### Phase 3 (Q3 2024)
- 📋 Logistics integration
- 📋 AI-powered recommendations
- 📋 Blockchain integration
- 📋 IoT sensor support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Indian Local Markets** - For inspiring this platform
- **Open Source Community** - For amazing tools and libraries
- **Contributors** - For making this project better

## 📞 Support

- **Email**: support@saudasetu.ai
- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/saudasetu-ai/issues)

---

**Made with ❤️ for Indian Local Markets**

*Empowering traditional markets with modern AI technology while preserving cultural values and ensuring fair trade for all.*