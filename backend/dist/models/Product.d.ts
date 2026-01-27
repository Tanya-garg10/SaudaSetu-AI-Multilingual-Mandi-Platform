import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Product.d.ts.map