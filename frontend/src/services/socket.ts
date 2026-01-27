import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Negotiation events
  joinNegotiation(negotiationId: string) {
    if (this.socket) {
      this.socket.emit('negotiation:join', negotiationId);
    }
  }

  leaveNegotiation(negotiationId: string) {
    if (this.socket) {
      this.socket.emit('negotiation:leave', negotiationId);
    }
  }

  sendMessage(data: {
    negotiationId: string;
    message: string;
    offerPrice?: number;
    offerQuantity?: number;
  }) {
    if (this.socket) {
      this.socket.emit('negotiation:message', data);
    }
  }

  acceptOffer(negotiationId: string) {
    if (this.socket) {
      this.socket.emit('negotiation:accept', { negotiationId });
    }
  }

  cancelNegotiation(negotiationId: string) {
    if (this.socket) {
      this.socket.emit('negotiation:cancel', { negotiationId });
    }
  }

  setTyping(negotiationId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('negotiation:typing', { negotiationId, isTyping });
    }
  }

  // Event listeners
  onMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('negotiation:message', callback);
    }
  }

  onOffer(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('negotiation:offer', callback);
    }
  }

  onStatusChange(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('negotiation:status', callback);
    }
  }

  onTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('negotiation:typing', callback);
    }
  }

  onJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('negotiation:joined', callback);
    }
  }

  // Remove listeners
  offMessage() {
    if (this.socket) {
      this.socket.off('negotiation:message');
    }
  }

  offOffer() {
    if (this.socket) {
      this.socket.off('negotiation:offer');
    }
  }

  offStatusChange() {
    if (this.socket) {
      this.socket.off('negotiation:status');
    }
  }

  offTyping() {
    if (this.socket) {
      this.socket.off('negotiation:typing');
    }
  }

  offJoined() {
    if (this.socket) {
      this.socket.off('negotiation:joined');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();