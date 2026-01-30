import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Minimize2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const AIChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'नमस्ते! मैं SaudaSetu AI असिस्टेंट हूं। मैं आपकी मदद कर सकता हूं:\n\n• बाजार की कीमतों के बारे में जानकारी\n• बेहतर सौदेबाजी के टिप्स\n• उत्पादों की खोज\n• भाषा अनुवाद\n\nआप मुझसे कुछ भी पूछ सकते हैं!',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateBotResponse = (userMessage: string): string => {
        const lowerMessage = userMessage.toLowerCase();

        // Price related queries
        if (lowerMessage.includes('कीमत') || lowerMessage.includes('price') || lowerMessage.includes('रेट')) {
            return 'मैं आपको वर्तमान बाजार कीमतों की जानकारी दे सकता हूं:\n\n• टमाटर: ₹30-40 प्रति किलो\n• प्याज: ₹25-35 प्रति किलो\n• आम: ₹150-200 प्रति किलो\n• चावल: ₹100-120 प्रति किलो\n\nMarketplace में जाकर सभी उत्पादों की live कीमतें देख सकते हैं।';
        }

        // Negotiation tips
        if (lowerMessage.includes('सौदेबाजी') || lowerMessage.includes('negotiation') || lowerMessage.includes('बातचीत')) {
            return 'सौदेबाजी के लिए बेहतरीन टिप्स:\n\n• हमेशा विनम्र रहें\n• बाजार की कीमत जानें\n• थोक में खरीदारी करें\n• विक्रेता के साथ अच्छे संबंध बनाएं\n• गुणवत्ता को भी ध्यान में रखें\n\nहमारा AI negotiation engine आपको fair price suggest करता है!';
        }

        // Product search
        if (lowerMessage.includes('खोज') || lowerMessage.includes('search') || lowerMessage.includes('ढूंढ')) {
            return 'उत्पाद खोजने के लिए:\n\n• Marketplace पर जाएं\n• Category से filter करें\n• Location के आधार पर खोजें\n• Price range set करें\n• Search bar का उपयोग करें\n\nहमारे पास vegetables, fruits, grains, spices और बहुत कुछ है!';
        }

        // Language help
        if (lowerMessage.includes('भाषा') || lowerMessage.includes('language') || lowerMessage.includes('अनुवाद')) {
            return 'हमारा platform 12 भारतीय भाषाओं को support करता है:\n\n• हिंदी, अंग्रेजी, बंगाली\n• तेलुगु, मराठी, तमिल\n• गुजराती, कन्नड़, मलयालम\n• पंजाबी, उड़िया, असमिया\n\nReal-time translation के साथ किसी भी भाषा में बात करें!';
        }

        // Registration help
        if (lowerMessage.includes('रजिस्टर') || lowerMessage.includes('register') || lowerMessage.includes('खाता')) {
            return 'SaudaSetu में join करने के लिए:\n\n• Register पर click करें\n• अपनी details भरें\n• Buyer या Vendor choose करें\n• अपनी preferred language select करें\n• Location add करें\n\nDemo के लिए:\nEmail: amit.kumar@example.com\nPassword: password123';
        }

        // Features
        if (lowerMessage.includes('फीचर') || lowerMessage.includes('features') || lowerMessage.includes('सुविधा')) {
            return 'SaudaSetu AI के मुख्य features:\n\n🤖 AI-powered price discovery\n💬 Real-time multilingual chat\n📊 Smart negotiation engine\n📱 Responsive dashboards\n🔍 Advanced product search\n⚡ Live market trends\n🛡️ Secure transactions';
        }

        // Greetings
        if (lowerMessage.includes('नमस्ते') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            const greeting = user ? `नमस्ते ${user.name}!` : 'नमस्ते!';
            return `${greeting} SaudaSetu AI में आपका स्वागत है! मैं आपकी कैसे मदद कर सकता हूं?\n\nआप मुझसे बाजार की कीमतें, सौदेबाजी के टिप्स, या कोई भी सवाल पूछ सकते हैं।`;
        }

        // Default response
        return 'मैं आपकी मदद करने के लिए यहां हूं! आप मुझसे पूछ सकते हैं:\n\n• "कीमत क्या है?" - बाजार की कीमतें जानने के लिए\n• "सौदेबाजी कैसे करें?" - negotiation tips के लिए\n• "उत्पाद कैसे खोजें?" - search help के लिए\n• "भाषा बदलें" - language options के लिए\n\nकुछ और पूछना चाहते हैं?';
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate AI thinking time
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: generateBotResponse(inputText),
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1000 + Math.random() * 2000); // 1-3 seconds delay
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
            >
                <MessageCircle className="h-6 w-6" />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-80 h-96'
            }`}>
            {/* Header */}
            <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5" />
                    <span className="font-semibold">SaudaSetu AI</span>
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="hover:bg-green-700 p-1 rounded"
                    >
                        <Minimize2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hover:bg-green-700 p-1 rounded"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="h-64 overflow-y-auto p-4 space-y-3">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                                    }`}>
                                    <div className={`p-2 rounded-full ${message.sender === 'user' ? 'bg-green-100' : 'bg-blue-100'
                                        }`}>
                                        {message.sender === 'user' ? (
                                            <User className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Bot className="h-4 w-4 text-blue-600" />
                                        )}
                                    </div>
                                    <div className={`p-3 rounded-lg ${message.sender === 'user'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                                        <p className="text-xs mt-1 opacity-70">
                                            {message.timestamp.toLocaleTimeString('hi-IN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex items-start space-x-2">
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <Bot className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="अपना सवाल यहां लिखें..."
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputText.trim() || isTyping}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIChatbot;