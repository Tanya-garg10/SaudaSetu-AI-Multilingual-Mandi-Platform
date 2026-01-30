import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    Send,
    Bot,
    TrendingUp,
    Scale,
    Globe,
    MessageCircle,
    AlertCircle,
    CheckCircle,
    Clock,
    Users,
    Lightbulb,
    BarChart3,
    Target,
    Heart
} from 'lucide-react';
import { negotiationsApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useSocket } from '../hooks/useSocket';

interface Message {
    _id: string;
    senderId: string;
    message: string;
    translatedMessage?: string;
    offerPrice?: number;
    offerQuantity?: number;
    timestamp: string;
    senderName?: string;
    senderRole?: 'buyer' | 'vendor';
}

interface AISuggestion {
    suggestedPrice: number;
    reasoning: string;
    confidence: number;
    culturallyAppropriate: boolean;
    fairnessScore: number;
    marketJustification: string;
    translatedMessage?: string;
}

interface FairnessAnalysis {
    fairnessScore: number;
    analysis: string;
    recommendations: string[];
}

interface PriceDiscovery {
    averagePrice: number;
    priceRange: { min: number; max: number };
    marketTrend: 'rising' | 'falling' | 'stable';
    confidence: number;
    aiInsights: {
        seasonalFactor: number;
        demandLevel: 'high' | 'medium' | 'low';
        supplyStatus: 'abundant' | 'normal' | 'scarce';
        recommendations: string[];
    };
}

const EnhancedNegotiationChat: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [message, setMessage] = useState('');
    const [offerPrice, setOfferPrice] = useState<number | ''>('');
    const [offerQuantity, setOfferQuantity] = useState<number | ''>('');
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [showPriceDiscovery, setShowPriceDiscovery] = useState(false);
    const [showFairnessAnalysis, setShowFairnessAnalysis] = useState(false);
    const [autoTranslate, setAutoTranslate] = useState(true);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
    const [fairnessAnalysis, setFairnessAnalysis] = useState<FairnessAnalysis | null>(null);
    const [priceDiscovery, setPriceDiscovery] = useState<PriceDiscovery | null>(null);

    // Socket connection
    const socket = useSocket();

    // Fetch negotiation data
    const { data: negotiation, isLoading } = useQuery(
        ['negotiation', id],
        () => negotiationsApi.getNegotiation(id!),
        {
            enabled: !!id,
            refetchInterval: 5000 // Refresh every 5 seconds
        }
    );

    // Send message mutation
    const sendMessageMutation = useMutation(
        (messageData: { message: string; offerPrice?: number; offerQuantity?: number }) =>
            negotiationsApi.addMessage(id!, messageData),
        {
            onSuccess: () => {
                setMessage('');
                setOfferPrice('');
                setOfferQuantity('');
                queryClient.invalidateQueries(['negotiation', id]);
            }
        }
    );

    // Socket event handlers
    useEffect(() => {
        if (!socket || !id) return;

        // Join negotiation room
        socket.emit('negotiation:join', id);

        // Listen for new messages
        socket.on('negotiation:message', (data: any) => {
            queryClient.invalidateQueries(['negotiation', id]);
        });

        // Listen for typing indicators
        socket.on('negotiation:typing', (data: { userId: string; isTyping: boolean }) => {
            if (data.userId !== user?.id) {
                setTypingUsers(prev =>
                    data.isTyping
                        ? [...prev.filter(u => u !== data.userId), data.userId]
                        : prev.filter(u => u !== data.userId)
                );
            }
        });

        // Listen for AI suggestions
        socket.on('ai_suggestion', (suggestion: AISuggestion) => {
            setAiSuggestion(suggestion);
            setShowAIPanel(true);
        });

        // Listen for fairness analysis
        socket.on('fairness_analysis', (analysis: FairnessAnalysis) => {
            setFairnessAnalysis(analysis);
        });

        // Listen for price discovery
        socket.on('price_discovery', (discovery: PriceDiscovery) => {
            setPriceDiscovery(discovery);
        });

        return () => {
            socket.off('negotiation:message');
            socket.off('negotiation:typing');
            socket.off('ai_suggestion');
            socket.off('fairness_analysis');
            socket.off('price_discovery');
            socket.emit('negotiation:leave', id);
        };
    }, [socket, id, user?.id, queryClient]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [negotiation?.data?.messages]);

    // Handle typing
    const handleTyping = (isTyping: boolean) => {
        if (socket && id) {
            socket.emit('negotiation:typing', { negotiationId: id, isTyping });
        }
    };

    // Send message
    const handleSendMessage = () => {
        if (!message.trim() && !offerPrice && !offerQuantity) return;

        const messageData: any = { message: message.trim() };

        if (offerPrice && offerQuantity) {
            messageData.offerPrice = Number(offerPrice);
            messageData.offerQuantity = Number(offerQuantity);
        }

        sendMessageMutation.mutate(messageData);

        // Send via socket for real-time updates
        if (socket && id) {
            socket.emit('negotiation:message', {
                negotiationId: id,
                ...messageData
            });
        }
    };

    // Request AI assistance
    const requestAIAssistance = () => {
        if (socket && id) {
            socket.emit('request_ai_suggestion', { negotiationId: id });
        }
    };

    // Request fairness analysis
    const requestFairnessAnalysis = () => {
        if (socket && id) {
            socket.emit('request_fairness_analysis', { negotiationId: id });
            setShowFairnessAnalysis(true);
        }
    };

    // Request price discovery
    const requestPriceDiscovery = () => {
        if (socket && id && negotiation?.data?.productId) {
            socket.emit('request_price_discovery', {
                category: negotiation.data.productId.category,
                location: `${negotiation.data.productId.location.city}, ${negotiation.data.productId.location.state}`
            });
            setShowPriceDiscovery(true);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!negotiation?.data) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Negotiation not found</h3>
            </div>
        );
    }

    const { productId, messages, currentOffer, status } = negotiation.data;
    const isCompleted = status === 'completed';
    const userRole = user?.role;

    return (
        <div className="max-w-6xl mx-auto p-4">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {productId.name} - Negotiation
                        </h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {userRole === 'buyer' ? 'You (Buyer)' : 'You (Vendor)'}
                            </span>
                            <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {status === 'active' ? 'Active' : status}
                            </span>
                            <span className="flex items-center">
                                <Target className="h-4 w-4 mr-1" />
                                Current: ₹{currentOffer.price}/{productId.unit}
                            </span>
                        </div>
                    </div>

                    {/* AI Tools */}
                    <div className="flex space-x-2">
                        <button
                            onClick={requestAIAssistance}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Bot className="h-4 w-4" />
                            <span>AI Assistant</span>
                        </button>
                        <button
                            onClick={requestFairnessAnalysis}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            <Scale className="h-4 w-4" />
                            <span>Fairness</span>
                        </button>
                        <button
                            onClick={requestPriceDiscovery}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <TrendingUp className="h-4 w-4" />
                            <span>Market</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chat Area */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* Messages */}
                        <div className="h-96 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg: Message) => (
                                <div
                                    key={msg._id}
                                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.senderId === user?.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        <div className="text-sm font-medium mb-1">
                                            {msg.senderName} ({msg.senderRole})
                                        </div>
                                        <div className="text-sm">
                                            {autoTranslate && msg.translatedMessage ? msg.translatedMessage : msg.message}
                                        </div>
                                        {msg.offerPrice && msg.offerQuantity && (
                                            <div className="mt-2 p-2 bg-white bg-opacity-20 rounded text-xs">
                                                <strong>Offer:</strong> ₹{msg.offerPrice} for {msg.offerQuantity} {productId.unit}
                                            </div>
                                        )}
                                        {autoTranslate && msg.translatedMessage && (
                                            <div className="mt-1 flex items-center text-xs opacity-75">
                                                <Globe className="h-3 w-3 mr-1" />
                                                Translated
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicators */}
                            {typingUsers.length > 0 && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                            <span className="text-xs text-gray-500">typing...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        {!isCompleted && (
                            <div className="border-t p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={autoTranslate}
                                            onChange={(e) => setAutoTranslate(e.target.checked)}
                                            className="rounded"
                                        />
                                        <span className="text-sm text-gray-600">Auto-translate</span>
                                    </label>
                                </div>

                                {/* Offer inputs */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <input
                                        type="number"
                                        placeholder="Offer price (₹)"
                                        value={offerPrice}
                                        onChange={(e) => setOfferPrice(e.target.value ? Number(e.target.value) : '')}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        placeholder={`Quantity (${productId.unit})`}
                                        value={offerQuantity}
                                        onChange={(e) => setOfferQuantity(e.target.value ? Number(e.target.value) : '')}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        value={message}
                                        onChange={(e) => {
                                            setMessage(e.target.value);
                                            handleTyping(e.target.value.length > 0);
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={sendMessageMutation.isLoading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Panels */}
                <div className="space-y-6">
                    {/* AI Suggestion Panel */}
                    {showAIPanel && aiSuggestion && (
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <Bot className="h-5 w-5 mr-2 text-blue-600" />
                                    AI Suggestion
                                </h3>
                                <button
                                    onClick={() => setShowAIPanel(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-lg font-bold text-blue-900">
                                        ₹{aiSuggestion.suggestedPrice}
                                    </div>
                                    <div className="text-sm text-blue-700">
                                        Confidence: {(aiSuggestion.confidence * 100).toFixed(0)}%
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-1">Reasoning</h4>
                                    <p className="text-sm text-gray-600">{aiSuggestion.reasoning}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-1">Market Justification</h4>
                                    <p className="text-sm text-gray-600">{aiSuggestion.marketJustification}</p>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center">
                                        <Heart className={`h-4 w-4 mr-1 ${aiSuggestion.fairnessScore > 0.7 ? 'text-green-500' : 'text-yellow-500'}`} />
                                        Fairness: {(aiSuggestion.fairnessScore * 100).toFixed(0)}%
                                    </span>
                                    <span className="flex items-center">
                                        <CheckCircle className={`h-4 w-4 mr-1 ${aiSuggestion.culturallyAppropriate ? 'text-green-500' : 'text-red-500'}`} />
                                        {aiSuggestion.culturallyAppropriate ? 'Culturally OK' : 'Cultural Concern'}
                                    </span>
                                </div>

                                <button
                                    onClick={() => {
                                        setOfferPrice(aiSuggestion.suggestedPrice);
                                        setMessage(aiSuggestion.translatedMessage || aiSuggestion.reasoning);
                                    }}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Use This Suggestion
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Fairness Analysis Panel */}
                    {showFairnessAnalysis && fairnessAnalysis && (
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <Scale className="h-5 w-5 mr-2 text-purple-600" />
                                    Fairness Analysis
                                </h3>
                                <button
                                    onClick={() => setShowFairnessAnalysis(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-purple-50 p-3 rounded-lg">
                                    <div className="text-lg font-bold text-purple-900">
                                        {(fairnessAnalysis.fairnessScore * 100).toFixed(0)}% Fair
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{ width: `${fairnessAnalysis.fairnessScore * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-1">Analysis</h4>
                                    <p className="text-sm text-gray-600">{fairnessAnalysis.analysis}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-1">Recommendations</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {fairnessAnalysis.recommendations.map((rec, index) => (
                                            <li key={index} className="flex items-start">
                                                <Lightbulb className="h-3 w-3 mr-1 mt-0.5 text-yellow-500" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Price Discovery Panel */}
                    {showPriceDiscovery && priceDiscovery && (
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                                    Market Analysis
                                </h3>
                                <button
                                    onClick={() => setShowPriceDiscovery(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="text-lg font-bold text-green-900">
                                        ₹{priceDiscovery.averagePrice} avg
                                    </div>
                                    <div className="text-sm text-green-700">
                                        Range: ₹{priceDiscovery.priceRange.min} - ₹{priceDiscovery.priceRange.max}
                                    </div>
                                    <div className="flex items-center mt-1">
                                        <TrendingUp className={`h-4 w-4 mr-1 ${priceDiscovery.marketTrend === 'rising' ? 'text-red-500' :
                                                priceDiscovery.marketTrend === 'falling' ? 'text-green-500' : 'text-gray-500'
                                            }`} />
                                        <span className="text-sm capitalize">{priceDiscovery.marketTrend}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-gray-50 p-2 rounded">
                                        <div className="font-medium">Demand</div>
                                        <div className={`capitalize ${priceDiscovery.aiInsights.demandLevel === 'high' ? 'text-red-600' :
                                                priceDiscovery.aiInsights.demandLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                            }`}>
                                            {priceDiscovery.aiInsights.demandLevel}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <div className="font-medium">Supply</div>
                                        <div className={`capitalize ${priceDiscovery.aiInsights.supplyStatus === 'scarce' ? 'text-red-600' :
                                                priceDiscovery.aiInsights.supplyStatus === 'normal' ? 'text-yellow-600' : 'text-green-600'
                                            }`}>
                                            {priceDiscovery.aiInsights.supplyStatus}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-1">AI Insights</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {priceDiscovery.aiInsights.recommendations.slice(0, 3).map((rec, index) => (
                                            <li key={index} className="flex items-start">
                                                <MessageCircle className="h-3 w-3 mr-1 mt-0.5 text-blue-500" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnhancedNegotiationChat;