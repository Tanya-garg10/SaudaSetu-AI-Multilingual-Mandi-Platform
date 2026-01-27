"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Negotiation_1 = __importDefault(require("../models/Negotiation"));
const translation_1 = require("../services/translation");
const User_1 = __importDefault(require("../models/User"));
const setupSocketHandlers = (io) => {
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
            socket.userId = decoded.userId;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`User ${socket.userId} connected`);
        // Join negotiation room
        socket.on('negotiation:join', async (negotiationId) => {
            try {
                const negotiation = await Negotiation_1.default.findOne({
                    _id: negotiationId,
                    $or: [
                        { buyerId: socket.userId },
                        { vendorId: socket.userId }
                    ]
                });
                if (negotiation) {
                    socket.join(`negotiation:${negotiationId}`);
                    socket.emit('negotiation:joined', { negotiationId });
                    console.log(`User ${socket.userId} joined negotiation ${negotiationId}`);
                }
                else {
                    socket.emit('error', { message: 'Negotiation not found or unauthorized' });
                }
            }
            catch (error) {
                socket.emit('error', { message: 'Failed to join negotiation' });
            }
        });
        // Leave negotiation room
        socket.on('negotiation:leave', (negotiationId) => {
            socket.leave(`negotiation:${negotiationId}`);
            console.log(`User ${socket.userId} left negotiation ${negotiationId}`);
        });
        // Handle new message
        socket.on('negotiation:message', async (data) => {
            try {
                const negotiation = await Negotiation_1.default.findOne({
                    _id: data.negotiationId,
                    $or: [
                        { buyerId: socket.userId },
                        { vendorId: socket.userId }
                    ],
                    status: 'active'
                }).populate(['buyerId', 'vendorId']);
                if (!negotiation) {
                    socket.emit('error', { message: 'Negotiation not found or inactive' });
                    return;
                }
                // Get sender and receiver info
                const sender = await User_1.default.findById(socket.userId);
                const isFromBuyer = negotiation.buyerId._id.toString() === socket.userId;
                const receiver = isFromBuyer ? negotiation.vendorId : negotiation.buyerId;
                // Translate message if needed
                let translatedMessage = data.message;
                if (sender?.preferredLanguage !== receiver.preferredLanguage) {
                    try {
                        const translation = await translation_1.translationService.translate(data.message, sender?.preferredLanguage || 'en', receiver.preferredLanguage);
                        translatedMessage = translation.translatedText;
                    }
                    catch (error) {
                        console.error('Translation error:', error);
                    }
                }
                // Create message object
                const messageObj = {
                    _id: new Date().getTime().toString(), // Temporary ID
                    senderId: socket.userId,
                    message: data.message,
                    translatedMessage: translatedMessage !== data.message ? translatedMessage : undefined,
                    offerPrice: data.offerPrice,
                    offerQuantity: data.offerQuantity,
                    timestamp: new Date()
                };
                // Add message to negotiation
                negotiation.messages.push(messageObj);
                // Update current offer if provided
                if (data.offerPrice && data.offerQuantity) {
                    negotiation.currentOffer = {
                        price: data.offerPrice,
                        quantity: data.offerQuantity,
                        proposedBy: socket.userId
                    };
                }
                await negotiation.save();
                // Broadcast to all users in the negotiation room
                io.to(`negotiation:${data.negotiationId}`).emit('negotiation:message', {
                    negotiationId: data.negotiationId,
                    message: messageObj,
                    senderName: sender?.name
                });
                // If there's an offer, broadcast it separately
                if (data.offerPrice && data.offerQuantity) {
                    io.to(`negotiation:${data.negotiationId}`).emit('negotiation:offer', {
                        negotiationId: data.negotiationId,
                        offer: {
                            price: data.offerPrice,
                            quantity: data.offerQuantity,
                            proposedBy: socket.userId,
                            proposedByName: sender?.name
                        }
                    });
                }
            }
            catch (error) {
                console.error('Message handling error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        // Handle offer acceptance
        socket.on('negotiation:accept', async (data) => {
            try {
                const negotiation = await Negotiation_1.default.findOne({
                    _id: data.negotiationId,
                    $or: [
                        { buyerId: socket.userId },
                        { vendorId: socket.userId }
                    ],
                    status: 'active'
                });
                if (!negotiation) {
                    socket.emit('error', { message: 'Negotiation not found or inactive' });
                    return;
                }
                // Complete the negotiation
                negotiation.status = 'completed';
                negotiation.finalPrice = negotiation.currentOffer.price;
                negotiation.finalQuantity = negotiation.currentOffer.quantity;
                await negotiation.save();
                // Broadcast completion to all users in the room
                io.to(`negotiation:${data.negotiationId}`).emit('negotiation:status', {
                    negotiationId: data.negotiationId,
                    status: 'completed',
                    finalPrice: negotiation.finalPrice,
                    finalQuantity: negotiation.finalQuantity
                });
            }
            catch (error) {
                console.error('Accept handling error:', error);
                socket.emit('error', { message: 'Failed to accept offer' });
            }
        });
        // Handle negotiation cancellation
        socket.on('negotiation:cancel', async (data) => {
            try {
                const negotiation = await Negotiation_1.default.findOne({
                    _id: data.negotiationId,
                    $or: [
                        { buyerId: socket.userId },
                        { vendorId: socket.userId }
                    ],
                    status: 'active'
                });
                if (!negotiation) {
                    socket.emit('error', { message: 'Negotiation not found or inactive' });
                    return;
                }
                negotiation.status = 'cancelled';
                await negotiation.save();
                // Broadcast cancellation to all users in the room
                io.to(`negotiation:${data.negotiationId}`).emit('negotiation:status', {
                    negotiationId: data.negotiationId,
                    status: 'cancelled'
                });
            }
            catch (error) {
                console.error('Cancel handling error:', error);
                socket.emit('error', { message: 'Failed to cancel negotiation' });
            }
        });
        // Handle typing indicators
        socket.on('negotiation:typing', (data) => {
            socket.to(`negotiation:${data.negotiationId}`).emit('negotiation:typing', {
                negotiationId: data.negotiationId,
                userId: socket.userId,
                isTyping: data.isTyping
            });
        });
        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User ${socket.userId} disconnected`);
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
//# sourceMappingURL=handlers.js.map