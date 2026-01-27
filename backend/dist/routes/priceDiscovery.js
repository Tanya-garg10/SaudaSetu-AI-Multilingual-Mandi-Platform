"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const priceDiscovery_1 = require("../services/priceDiscovery");
const router = express_1.default.Router();
// Get price discovery for a category and location
router.get('/', async (req, res) => {
    try {
        const { category, city, state } = req.query;
        if (!category) {
            return res.status(400).json({
                success: false,
                error: 'Category is required'
            });
        }
        const location = city && state ? `${city}, ${state}` : undefined;
        const priceData = await priceDiscovery_1.priceDiscoveryService.getPriceDiscovery(category, location);
        res.json({
            success: true,
            data: priceData
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
// Get market trends for multiple categories
router.get('/trends', async (req, res) => {
    try {
        const { categories, city, state } = req.query;
        if (!categories) {
            return res.status(400).json({
                success: false,
                error: 'Categories are required'
            });
        }
        const categoryList = categories.split(',');
        const location = city && state ? `${city}, ${state}` : undefined;
        const trends = await Promise.all(categoryList.map(async (category) => {
            const priceData = await priceDiscovery_1.priceDiscoveryService.getPriceDiscovery(category.trim(), location);
            return {
                category: category.trim(),
                ...priceData
            };
        }));
        res.json({
            success: true,
            data: trends
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
// Get price history for a category
router.get('/history', async (req, res) => {
    try {
        const { category, city, state, days = 30 } = req.query;
        if (!category) {
            return res.status(400).json({
                success: false,
                error: 'Category is required'
            });
        }
        const location = city && state ? `${city}, ${state}` : undefined;
        const history = await priceDiscovery_1.priceDiscoveryService.getPriceHistory(category, location, Number(days));
        res.json({
            success: true,
            data: history
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
// Get price comparison across locations
router.get('/compare', async (req, res) => {
    try {
        const { category, locations } = req.query;
        if (!category || !locations) {
            return res.status(400).json({
                success: false,
                error: 'Category and locations are required'
            });
        }
        const locationList = locations.split(',');
        const comparison = await Promise.all(locationList.map(async (location) => {
            const priceData = await priceDiscovery_1.priceDiscoveryService.getPriceDiscovery(category, location.trim());
            return {
                locationName: location.trim(),
                ...priceData
            };
        }));
        res.json({
            success: true,
            data: comparison
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
//# sourceMappingURL=priceDiscovery.js.map