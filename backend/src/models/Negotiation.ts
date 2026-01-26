import mongoose, { Schema, Document } from 'mongoose';

export interface INegotiationMessage {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  message: string;
  translatedMessage?: string;
  offerPrice?: number;
  offerQuantity?: number;
  timestamp: Date;
}

export interface INegotiation extends Document {
  productId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  status: 'active' | 'completed' | 'cancelled';
  messages: INegotiationMessage[];
  currentOffer: {
    price: number;
    quantity: number;
    proposedBy: mongoose.Types.ObjectId;
  };
  finalPrice?: number;
  finalQuantity?: number;
  createdAt: Date;
  updatedAt: Date;
}

const NegotiationMessageSchema: Schema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  translatedMessage: {
    type: String
  },
  offerPrice: {
    type: Number,
    min: 0
  },
  offerQuantity: {
    type: Number,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const NegotiationSchema: Schema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  messages: [NegotiationMessageSchema],
  currentOffer: {
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    proposedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  finalPrice: {
    type: Number,
    min: 0
  },
  finalQuantity: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

NegotiationSchema.index({ productId: 1, buyerId: 1, vendorId: 1 });
NegotiationSchema.index({ status: 1, updatedAt: -1 });

export default mongoose.model<INegotiation>('Negotiation', NegotiationSchema);