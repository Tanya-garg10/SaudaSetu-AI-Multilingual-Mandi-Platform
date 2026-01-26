import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  vendorId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  currentPrice: number;
  unit: string;
  quantity: number;
  images: string[];
  location: {
    city: string;
    state: string;
    coordinates: [number, number];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'vegetables',
      'fruits',
      'grains',
      'spices',
      'dairy',
      'meat',
      'fish',
      'pulses',
      'oils',
      'others'
    ]
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'gram', 'liter', 'piece', 'dozen', 'quintal']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String
  }],
  location: {
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

ProductSchema.index({ category: 1, 'location.city': 1 });
ProductSchema.index({ vendorId: 1, isActive: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);