import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import negotiationRoutes from './routes/negotiations';
import priceDiscoveryRoutes from './routes/priceDiscovery';
import translationRoutes from './routes/translation';
import { setupSocketHandlers } from './socket/handlers';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/price-discovery', priceDiscoveryRoutes);
app.use('/api/translation', translationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Socket setup
setupSocketHandlers(io);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saudasetu');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Running without database connection for demo purposes');
    console.log('To use full functionality, please install MongoDB or use MongoDB Atlas');
  }
};

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend: http://localhost:5173`);
    console.log(`Backend: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
  });
}).catch(() => {
  // Start server even without database for demo
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (without database)`);
    console.log(`Frontend: http://localhost:5173`);
    console.log(`Backend: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
  });
});

export { io };