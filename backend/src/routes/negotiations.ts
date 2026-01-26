import express from 'express';
import Joi from 'joi';
import Negotiation from '../models/Negotiation';
import Product from '../models/Product';
import { auth } from '../middleware/auth';
import { negotiationEngine } from '../services/negotiationEngine';

const router = express.Router();

const createNegotiationSchema = Joi.object({
  productId: Joi.string().required(),
  initialOffer: Joi.object({
    price: Joi.number().min(0).required(),
    quantity: Joi.number().min(0).required()
  }).required(),
  message: Joi.string().required()
});

const messageSchema = Joi.object({
  message: Joi.string().required(),
  offerPrice: Joi.number().min(0),
  offerQuantity: Joi.number().min(0)
});

// Create negotiation
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = createNegotiationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const product = await Product.findById(value.productId).populate('vendorId');
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (product.vendorId._id.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot negotiate on your own product'
      });
    }

    const existingNegotiation = await Negotiation.findOne({
      productId: value.productId,
      buyerId: req.user.userId,
      status: 'active'
    });

    if (existingNegotiation) {
      return res.status(400).json({
        success: false,
        error: 'Active negotiation already exists for this product'
      });
    }

    const negotiation = new Negotiation({
      productId: value.productId,
      buyerId: req.user.userId,
      vendorId: product.vendorId._id,
      currentOffer: {
        price: value.initialOffer.price,
        quantity: value.initialOffer.quantity,
        proposedBy: req.user.userId
      },
      messages: [{
        senderId: req.user.userId,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get user's negotiations
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter: any = {
      $or: [
        { buyerId: req.user.userId },
        { vendorId: req.user.userId }
      ]
    };

    if (status) filter.status = status;

    const negotiations = await Negotiation.find(filter)
      .populate([
        { path: 'productId', select: 'name currentPrice unit images' },
        { path: 'buyerId', select: 'name email' },
        { path: 'vendorId', select: 'name email' }
      ])
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Negotiation.countDocuments(filter);

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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get negotiation by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const negotiation = await Negotiation.findOne({
      _id: req.params.id,
      $or: [
        { buyerId: req.user.userId },
        { vendorId: req.user.userId }
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Add message to negotiation
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { error, value } = messageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const negotiation = await Negotiation.findOne({
      _id: req.params.id,
      $or: [
        { buyerId: req.user.userId },
        { vendorId: req.user.userId }
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
      senderId: req.user.userId,
      message: value.message,
      offerPrice: value.offerPrice,
      offerQuantity: value.offerQuantity,
      timestamp: new Date()
    };

    negotiation.messages.push(message as any);

    if (value.offerPrice && value.offerQuantity) {
      negotiation.currentOffer = {
        price: value.offerPrice,
        quantity: value.offerQuantity,
        proposedBy: req.user.userId
      };

      // Use negotiation engine to suggest counter-offer
      const suggestion = await negotiationEngine.suggestCounterOffer(
        negotiation._id.toString(),
        value.offerPrice,
        value.offerQuantity
      );

      if (suggestion) {
        // Add AI suggestion as system message
        negotiation.messages.push({
          senderId: req.user.userId,
          message: `AI Suggestion: ${suggestion.reasoning}`,
          timestamp: new Date()
        } as any);
      }
    }

    await negotiation.save();

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Accept/Complete negotiation
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const negotiation = await Negotiation.findOne({
      _id: req.params.id,
      $or: [
        { buyerId: req.user.userId },
        { vendorId: req.user.userId }
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Cancel negotiation
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const negotiation = await Negotiation.findOne({
      _id: req.params.id,
      $or: [
        { buyerId: req.user.userId },
        { vendorId: req.user.userId }
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;