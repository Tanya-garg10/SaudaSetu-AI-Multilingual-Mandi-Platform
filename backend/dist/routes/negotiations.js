"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const Negotiation_1 = __importDefault(require("../models/Negotiation"));
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const createNegotiationSchema = joi_1.default.object({
    productId: joi_1.default.string().required(),
    initialOffer: joi_1.default.object({
        price: joi_1.default.number().min(0).required(),
        quantity: joi_1.default.number().min(0).required()
    }).required(),
    message: joi_1.default.string().required()
});
const messageSchema = joi_1.default.object({
    message: joi_1.default.string().required(),
    offerPrice: joi_1.default.number().min(0),
    offerQuantity: joi_1.default.number().min(0)
});
// Create negotiation
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const { error, value } = createNegotiationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        const product = await Product_1.default.findById(value.productId).populate('vendorId');
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        const vendorId = product.vendorId._id;
        if (vendorId.toString() === req.user?.userId) {
            return res.status(400).json({
                success: false,
                error: 'Cannot negotiate on your own product'
            });
        }
        const existingNegotiation = await Negotiation_1.default.findOne({
            productId: value.productId,
            buyerId: req.user?.userId,
            status: 'active'
        });
        if (existingNegotiation) {
            return res.status(400).json({
                success: false,
                error: 'Active negotiation already exists for this product'
            });
        }
        const negotiation = new Negotiation_1.default({
            productId: value.productId,
            buyerId: req.user?.userId,
            vendorId: vendorId,
            currentOffer: {
                price: value.initialOffer.price,
                quantity: value.initialOffer.quantity,
                proposedBy: req.user?.userId
            },
            messages: [{
                    senderId: req.user?.userId,
                    message: value.message,
                    offerPrice: value.initialOffer.price,
                    offerQuantity: value.initialOffer.quantity,
                    timestamp: new Date()
                }]
        });
        await negotiation.save();
        await negotiation.populate([
            { path: 'productId', select: 'name currentPrice unit' },
            { path: 'buyerId', select: 'name email' },
            { path: 'vendorId', select: 'name email' }
        ]);
        res.status(201).json({
            success: true,
            data: negotiation
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
// Get user's negotiations
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {
            $or: [
                { buyerId: req.user?.userId },
                { vendorId: req.user?.userId }
            ]
        };
        if (status)
            filter.status = status;
        const negotiations = await Negotiation_1.default.find(filter)
            .populate([
            { path: 'productId', select: 'name currentPrice unit images' },
            { path: 'buyerId', select: 'name email' },
            { path: 'vendorId', select: 'name email' }
        ])
            .sort({ updatedAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Negotiation_1.default.countDocuments(filter);
        res.json({
            success: true,
            data: {
                negotiations,
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
// Get negotiation by ID
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const negotiation = await Negotiation_1.default.findOne({
            _id: req.params.id,
            $or: [
                { buyerId: req.user?.userId },
                { vendorId: req.user?.userId }
            ]
        }).populate([
            { path: 'productId', select: 'name currentPrice unit images' },
            { path: 'buyerId', select: 'name email preferredLanguage' },
            { path: 'vendorId', select: 'name email preferredLanguage' },
            { path: 'messages.senderId', select: 'name' }
        ]);
        if (!negotiation) {
            return res.status(404).json({
                success: false,
                error: 'Negotiation not found'
            });
        }
        res.json({
            success: true,
            data: negotiation
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
// Add message to negotiation
router.post('/:id/messages', auth_1.auth, async (req, res) => {
    try {
        const { error, value } = messageSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        const negotiation = await Negotiation_1.default.findOne({
            _id: req.params.id,
            $or: [
                { buyerId: req.user?.userId },
                { vendorId: req.user?.userId }
            ],
            status: 'active'
        });
        if (!negotiation) {
            return res.status(404).json({
                success: false,
                error: 'Active negotiation not found'
            });
        }
        const message = {
            senderId: req.user?.userId,
            message: value.message,
            offerPrice: value.offerPrice,
            offerQuantity: value.offerQuantity,
            timestamp: new Date()
        };
        negotiation.messages.push(message);
        if (value.offerPrice && value.offerQuantity) {
            negotiation.currentOffer = {
                price: value.offerPrice,
                quantity: value.offerQuantity,
                proposedBy: req.user?.userId
            };
        }
        await negotiation.save();
        res.json({
            success: true,
            data: message
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
// Accept/Complete negotiation
router.post('/:id/complete', auth_1.auth, async (req, res) => {
    try {
        const negotiation = await Negotiation_1.default.findOne({
            _id: req.params.id,
            $or: [
                { buyerId: req.user?.userId },
                { vendorId: req.user?.userId }
            ],
            status: 'active'
        });
        if (!negotiation) {
            return res.status(404).json({
                success: false,
                error: 'Active negotiation not found'
            });
        }
        negotiation.status = 'completed';
        negotiation.finalPrice = negotiation.currentOffer.price;
        negotiation.finalQuantity = negotiation.currentOffer.quantity;
        await negotiation.save();
        res.json({
            success: true,
            data: negotiation
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
// Cancel negotiation
router.post('/:id/cancel', auth_1.auth, async (req, res) => {
    try {
        const negotiation = await Negotiation_1.default.findOne({
            _id: req.params.id,
            $or: [
                { buyerId: req.user?.userId },
                { vendorId: req.user?.userId }
            ],
            status: 'active'
        });
        if (!negotiation) {
            return res.status(404).json({
                success: false,
                error: 'Active negotiation not found'
            });
        }
        negotiation.status = 'cancelled';
        await negotiation.save();
        res.json({
            success: true,
            data: negotiation
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
//# sourceMappingURL=negotiations.js.map