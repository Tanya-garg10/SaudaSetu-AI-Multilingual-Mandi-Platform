import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Negotiation from '../models/Negotiation';
import { translationService } from '../services/translation';
import User from '../models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    // Join negotiation room
    socket.on('negotiation:join', async (negotiationId: string) => {
      try {
        const negotiation = await Negotiation.findOne({
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
        } else {
          socket.emit('error', { message: 'Negotiation not found or unauthorized' });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join negotiation' });
      }
    });

    // Leave negotiation room
    socket.on('negotiation:leave', (negotiationId: string) => {
      socket.leave(`negotiation:${negotiationId}`);
      console.log(`User ${socket.userId} left negotiation ${negotiationId}`);
    });

    // Handle new message
    socket.on('negotiation:message', async (data: {
      negotiationId: string;
      message: string;
      offerPrice?: number;
      offerQuantity?: number;
    }) => {
      try {
        const negotiation = await Negotiation.findOne({
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
        const sender = await User.findById(socket.userId);
        const isFromBuyer = negotiation.buyerId._id.toString() === socket.userId;
        const receiver = isFromBuyer ? negotiation.vendorId : negotiation.buyerId;

        // Translate message if needed
        let translatedMessage = data.message;
        if (sender?.preferredLanguage !== (receiver as any).preferredLanguage) {
          try {
            const translation = await translationService.translate(
              data.message,
              sender?.preferredLanguage as any || 'en',
              (receiver as any).preferredLanguage as any
            );
            translatedMessage = translation.translatedText;
          } catch (error) {
            console.error('Translation error:', error);
          }
        }

        // Create message object
        const messageObj = {
          _id: new Date().getTime().toString(), // Temporary ID
          senderId: socket.userId!,
          message: data.message,
          translatedMessage: translatedMessage !== data.message ? translatedMessage : undefined,
          offerPrice: data.offerPrice,
          offerQuantity: data.offerQuantity,
          timestamp: new Date()
        };

        // Add message to negotiation
        negotiation.messages.push(messageObj as any);

        // Update current offer if provided
        if (data.offerPrice && data.offerQuantity) {
          negotiation.currentOffer = {
            price: data.offerPrice,
            quantity: data.offerQuantity,
            proposedBy: socket.userId! as any
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
              proposedBy: socket.userId!,
              proposedByName: sender?.name
            }
          });
        }

      } catch (error) {
        console.error('Message handling error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle offer acceptance
    socket.on('negotiation:accept', async (data: {
      negotiationId: string;
    }) => {
      try {
        const negotiation = await Negotiation.findOne({
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

      } catch (error) {
        console.error('Accept handling error:', error);
        socket.emit('error', { message: 'Failed to accept offer' });
      }
    });

    // Handle negotiation cancellation
    socket.on('negotiation:cancel', async (data: {
      negotiationId: string;
    }) => {
      try {
        const negotiation = await Negotiation.findOne({
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

      } catch (error) {
        console.error('Cancel handling error:', error);
        socket.emit('error', { message: 'Failed to cancel negotiation' });
      }
    });

    // Handle typing indicators
    socket.on('negotiation:typing', (data: {
      negotiationId: string;
      isTyping: boolean;
    }) => {
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