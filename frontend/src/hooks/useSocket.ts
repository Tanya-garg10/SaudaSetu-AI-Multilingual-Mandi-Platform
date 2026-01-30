import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

let socket: Socket | null = null;

export const useSocket = () => {
    const { token } = useAuthStore();

    useEffect(() => {
        if (token && !socket) {
            // Initialize socket connection
            socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
                auth: {
                    token
                },
                transports: ['websocket', 'polling']
            });

            socket.on('connect', () => {
                console.log('Socket connected');
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        }

        return () => {
            if (socket && !token) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [token]);

    return socket;
};

export const useSocketConnection = () => {
    const [isConnected, setIsConnected] = useState(false);
    const socket = useSocket();

    useEffect(() => {
        if (socket) {
            const handleConnect = () => setIsConnected(true);
            const handleDisconnect = () => setIsConnected(false);

            socket.on('connect', handleConnect);
            socket.on('disconnect', handleDisconnect);

            setIsConnected(socket.connected);

            return () => {
                socket.off('connect', handleConnect);
                socket.off('disconnect', handleDisconnect);
            };
        }
    }, [socket]);

    return { socket, isConnected };
};