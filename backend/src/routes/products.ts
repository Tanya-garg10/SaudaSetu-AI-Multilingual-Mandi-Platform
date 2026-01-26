import express from 'express';
import Joi from 'joi';
import Product from '../models/Product';
import { auth } from '../middleware/auth';

const router = express.Router();

const productSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().required(),
  category: Joi.string().valid(
    'vegetables', 'fruits', 'grains', 'spices', 'dairy',
    'meat', 'fish', 'pulses', 'oils', 'others'
  ).required(),
  basePrice: Joi.number().min(0).required(),
  currentPrice: Joi.number().min(0).required(),
  unit: Joi.string().valid('kg', 'gram', 'liter', 'piece', 'dozen', 'quintal').required(),
  quantity: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string()),
  location: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required()
  }).required()
});

// Create product (vendors only)
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const product = new Product({
      ...value,
      vendorId: req.user.userId
    });

    await product.save();
    await product.populate('vendorId', 'name email phone');

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      city,
      state,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter: any = { isActive: true };

    if (category) filter.category = category;
    if (city) filter['location.city'] = new RegExp(city as string, 'i');
    if (state) filter['location.state'] = new RegExp(state as string, 'i');
    if (search) {
      filter.$text = { $search: search as string };
    }
    if (minPrice || maxPrice) {
      filter.currentPrice = {};
      if (minPrice) filter.currentPrice.$gte = Number(minPrice);
      if (maxPrice) filter.currentPrice.$lte = Number(maxPrice);
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(filter)
      .populate('vendorId', 'name email phone location')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Product.countDocuments(filter);

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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update product (vendor only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user.userId },
      value,
      { new: true }
    ).populate('vendorId', 'name email phone');

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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Delete product (vendor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user.userId },
      { isActive: false },
      { new: true }
    );

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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;