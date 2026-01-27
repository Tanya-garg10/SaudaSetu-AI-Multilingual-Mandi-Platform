"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const productSchema = joi_1.default.object({
    name: joi_1.default.string().required().trim(),
    description: joi_1.default.string().required(),
    category: joi_1.default.string().valid('vegetables', 'fruits', 'grains', 'spices', 'dairy', 'meat', 'fish', 'pulses', 'oils', 'others').required(),
    basePrice: joi_1.default.number().min(0).required(),
    currentPrice: joi_1.default.number().min(0).required(),
    unit: joi_1.default.string().valid('kg', 'gram', 'liter', 'piece', 'dozen', 'quintal').required(),
    quantity: joi_1.default.number().min(0).required(),
    images: joi_1.default.array().items(joi_1.default.string()),
    location: joi_1.default.object({
        city: joi_1.default.string().required(),
        state: joi_1.default.string().required(),
        coordinates: joi_1.default.array().items(joi_1.default.number()).length(2).required()
    }).required()
});
// Create product (vendors only)
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const { error, value } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        const product = new Product_1.default({
            ...value,
            vendorId: req.user?.userId
        });
        await product.save();
        await product.populate('vendorId', 'name email phone');
        res.status(201).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
// Get all products with filters
router.get('/', async (req, res) => {
    try {
        const { category, city, state, search, minPrice, maxPrice, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const filter = { isActive: true };
        if (category)
            filter.category = category;
        if (city)
            filter['location.city'] = new RegExp(city, 'i');
        if (state)
            filter['location.state'] = new RegExp(state, 'i');
        if (search) {
            filter.$text = { $search: search };
        }
        if (minPrice || maxPrice) {
            filter.currentPrice = {};
            if (minPrice)
                filter.currentPrice.$gte = Number(minPrice);
            if (maxPrice)
                filter.currentPrice.$lte = Number(maxPrice);
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const products = await Product_1.default.find(filter)
            .populate('vendorId', 'name email phone location')
            .sort(sort)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Product_1.default.countDocuments(filter);
        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
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
// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id)
            .populate('vendorId', 'name email phone location');
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        res.json({
            success: true,
            data: product
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
// Update product (vendor only)
router.put('/:id', auth_1.auth, async (req, res) => {
    try {
        const { error, value } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        const product = await Product_1.default.findOneAndUpdate({ _id: req.params.id, vendorId: req.user?.userId }, value, { new: true }).populate('vendorId', 'name email phone');
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found or unauthorized'
            });
        }
        res.json({
            success: true,
            data: product
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
// Delete product (vendor only)
router.delete('/:id', auth_1.auth, async (req, res) => {
    try {
        const product = await Product_1.default.findOneAndUpdate({ _id: req.params.id, vendorId: req.user?.userId }, { isActive: false }, { new: true });
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found or unauthorized'
            });
        }
        res.json({
            success: true,
            message: 'Product deactivated successfully'
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
//# sourceMappingURL=products.js.map