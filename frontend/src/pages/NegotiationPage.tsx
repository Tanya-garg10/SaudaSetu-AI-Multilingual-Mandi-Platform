import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { negotiationsApi } from '../services/api';
import { socketService } from '../services/socket';
import { useAuthStore } from '../stores/authStore';
import {
    Send,
    CheckCircle,
    XCircle,
    MessageCircle,
    DollarSign,
    Package,
    User,
    Clock
} from 'lucide-react';

const NegotiationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user, token } = useAuthStore();
    const [message, setMessage] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [offerQuantity, setOfferQuantity] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const { data: negotiation, isLoading } = useQuery(
        ['negotiation', id],
        () => negotiationsApi.getNegotiation(id!),
        {
            enabled: !!id,
            refetchInterval: 5000 // Refetch every 5 seconds as fallback
        }
    );

    const sendMessageMutation = useMutation(
        (data: { message: string; offerPrice?: number; offerQuantity?: number }) =>
            negotiationsApi.addMessage(id!, data),
        {
            onSuccess: () => {
                setMessage('');
                setOfferPrice('');
                setOfferQuantity('');
                queryClient.invalidateQueries(['negotiation', id]);
            },
            onError: () => {
                toast.error('Failed to send message');
            }
        }
    );

    const completeMutation = useMutation(
        () => negotiationsApi.completeNegotiation(id!),
        {
            onSuccess: () => {
                toast.success('Negotiation completed successfully!');
                queryClient.invalidateQueries(['negotiation', id]);
            },
            onError: () => {
                toast.error('Failed to complete negotiation');
            }
        }
    );

    const cancelMutation = useMutation(
        () => negotiationsApi.cancelNegotiation(id!),
        {
            onSuccess: () => {
                toast.success('Negotiation cancelled');
                queryClient.invalidateQueries(['negotiation', id]);
            },
            onError: () => {
                toast.error('Failed to cancel negotiation');
            }
        }
    );

    useEffect(() => {
        if (token && id) {
            socketService.connect(token);
            socketService.joinNegotiation(id);

            // Set up socket listeners
            socketService.onMessage((data) => {
                queryClient.invalidateQueries(['negotiation', id]);
            });

            socketService.onOffer((data) => {
                queryClient.invalidateQueries(['negotiation', id]);
                toast.success('New offer received!');
            });

            socketService.onStatusChange((data) => {
                queryClient.invalidateQueries(['negotiation', id]);
                if (data.status === 'completed') {
                    toast.success('Negotiation completed!');
                } else if (data.status === 'cancelled') {
                    toast.error('Negotiation cancelled');
                }
            });

            socketService.onTyping((data) => {
                if (data.userId !== user?._id) {
                    if (data.isTyping) {
                        setTypingUsers(prev => [...prev.filter(u => u !== data.userId), data.userId]);
                    } else {
                        setTypingUsers(prev => prev.filter(u => u !== data.userId));
                    }
                }
            });

            return () => {
                socketService.leaveNegotiation(id);
                socketService.offMessage();
                socketService.offOffer();
                socketService.offStatusChange();
                socketService.offTyping();
            };
        }
    }, [token, id, user?._id, queryClient]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [negotiation?.data?.messages]);

    const handleSendMessage = () => {
        if (!message.trim() && !offerPrice && !offerQuantity) return;

        const messageData: any = { message: message.trim() };

        if (offerPrice && offerQuantity) {
            messageData.offerPrice = parseFloat(offerPrice);
            messageData.offerQuantity = parseFloat(offerQuantity);
        }

        // Send via socket for real-time update
        socketService.sendMessage({
            negotiationId: id!,
            ...messageData
        });

        // Also send via API as backup
        sendMessageMutation.mutate(messageData);
    };

    const handleTyping = (typing: boolean) => {
        if (typing !== isTyping) {
            setIsTyping(typing);
            socketService.setTyping(id!, typing);
        }
    };

    const handleAccept = () => {
        socketService.acceptOffer(id!);
        completeMutation.mutate();
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel this negotiation?')) {
            socketService.cancelNegotiation(id!);
            cancelMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!negotiation?.data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Negotiation not found</h2>
                    <p className="text-gray-600">The negotiation you're looking for doesn't exist or you don't have access to it.</p>
                </div>
            </div>
        );
    }

    const neg = negotiation.data;
    const product = neg.productId as any;
    const buyer = neg.buyerId as any;
    const vendor = neg.vendorId as any;
    const isVendor = user?._id === vendor._id;
    const otherParty = isVendor ? buyer : vendor;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Negotiation</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${neg.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                neg.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                            }`}>
                            {neg.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Product Info */}
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Package className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Product</p>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-600">Base: ₹{product.currentPrice}/{product.unit}</p>
                            </div>
                        </div>

                        {/* Other Party */}
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{isVendor ? 'Buyer' : 'Vendor'}</p>
                                <p className="font-medium text-gray-900">{otherParty.name}</p>
                                <p className="text-sm text-gray-600">{otherParty.email}</p>
                            </div>
                        </div>

                        {/* Current Offer */}
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Current Offer</p>
                                <p className="font-medium text-gray-900">
                                    ₹{neg.currentOffer.price} × {neg.currentOffer.quantity} {product.unit}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Total: ₹{(neg.currentOffer.price * neg.currentOffer.quantity).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <MessageCircle className="h-5 w-5" />
                            <span>Messages</span>
                        </h2>
                    </div>

                    <div className="h-96 overflow-y-auto p-4 space-y-4">
                        {neg.messages.map((msg: any, index: number) => {
                            const isOwnMessage = msg.senderId === user?._id;
                            return (
                                <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-200 text-gray-900'
                                        }`}>
                                        <p className="text-sm">{msg.message}</p>
                                        {msg.translatedMessage && msg.translatedMessage !== msg.message && (
                                            <p className="text-xs mt-1 opacity-75 italic">
                                                Translation: {msg.translatedMessage}
                                            </p>
                                        )}
                                        {msg.offerPrice && msg.offerQuantity && (
                                            <div className="mt-2 p-2 bg-black bg-opacity-20 rounded text-xs">
                                                <p>Offer: ₹{msg.offerPrice} × {msg.offerQuantity} {product.unit}</p>
                                                <p>Total: ₹{(msg.offerPrice * msg.offerQuantity).toFixed(2)}</p>
                                            </div>
                                        )}
                                        <p className="text-xs mt-1 opacity-75">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        {typingUsers.length > 0 && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <span>typing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Message Input */}
                {neg.status === 'active' && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="space-y-4">
                            {/* Offer Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Offer Price (₹ per {product.unit})
                                    </label>
                                    <input
                                        type="number"
                                        value={offerPrice}
                                        onChange={(e) => setOfferPrice(e.target.value)}
                                        placeholder="Enter price"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity ({product.unit})
                                    </label>
                                    <input
                                        type="number"
                                        value={offerQuantity}
                                        onChange={(e) => setOfferQuantity(e.target.value)}
                                        placeholder="Enter quantity"
                                        max={product.quantity}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Message Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => {
                                            setMessage(e.target.value);
                                            handleTyping(e.target.value.length > 0);
                                        }}
                                        onBlur={() => handleTyping(false)}
                                        placeholder="Type your message..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={sendMessageMutation.isLoading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>Send</span>
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleAccept}
                                    disabled={completeMutation.isLoading}
                                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Accept Current Offer</span>
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelMutation.isLoading}
                                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                >
                                    <XCircle className="h-4 w-4" />
                                    <span>Cancel Negotiation</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Completed/Cancelled Status */}
                {neg.status !== 'active' && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-center">
                            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${neg.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {neg.status === 'completed' ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <XCircle className="h-4 w-4" />
                                )}
                                <span>
                                    {neg.status === 'completed'
                                        ? `Deal completed at ₹${neg.finalPrice} × ${neg.finalQuantity} ${product.unit}`
                                        : 'Negotiation cancelled'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NegotiationPage;