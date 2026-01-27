"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const joi_1 = __importDefault(require("joi"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const registerSchema = joi_1.default.object({
    name: joi_1.default.string().required().trim(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    phone: joi_1.default.string().required(),
    role: joi_1.default.string().valid('buyer', 'vendor').required(),
    preferredLanguage: joi_1.default.string().default('hi'),
    location: joi_1.default.object({
        city: joi_1.default.string().required(),
        state: joi_1.default.string().required(),
        coordinates: joi_1.default.array().items(joi_1.default.number()).length(2).required()
    }).required()
});
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
// Register
router.post('/register', async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        const existingUser = await User_1.default.findOne({
            $or: [{ email: value.email }, { phone: value.phone }]
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email or phone'
            });
        }
        const user = new User_1.default(value);
        await user.save();
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json({
            success: true,
            data: {
                user: userResponse,
                token
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        const user = await User_1.default.findOne({ email: value.email });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        const isMatch = await user.comparePassword(value.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({
            success: true,
            data: {
                user: userResponse,
                token
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
// Get current user
router.get('/me', auth_1.auth, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.userId).select('-password');
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map