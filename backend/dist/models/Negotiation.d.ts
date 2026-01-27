import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<INegotiation, {}, {}, {}, mongoose.Document<unknown, {}, INegotiation, {}, {}> & INegotiation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Negotiation.d.ts.map