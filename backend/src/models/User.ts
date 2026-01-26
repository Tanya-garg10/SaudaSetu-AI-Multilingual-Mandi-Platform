import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'buyer' | 'vendor';
  preferredLanguage: string;
  location: {
    city: string;
    state: string;
    coordinates: [number, number];
  };
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['buyer', 'vendor'],
    required: true
  },
  preferredLanguage: {
    type: String,
    default: 'hi'
  },
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
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);