"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const negotiations_1 = __importDefault(require("./routes/negotiations"));
const priceDiscovery_1 = __importDefault(require("./routes/priceDiscovery"));
const translation_1 = __importDefault(require("./routes/translation"));
const handlers_1 = require("./socket/handlers");
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/negotiations', negotiations_1.default);
app.use('/api/price-discovery', priceDiscovery_1.default);
app.use('/api/translation', translation_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling
app.use(errorHandler_1.errorHandler);
// Socket setup
(0, handlers_1.setupSocketHandlers)(io);
// Database connection
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saudasetu');
        console.log('MongoDB connected successfully');
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map