import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

const WelcomeMessage: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show welcome message after a short delay
        const timer = setTimeout(() => {
            const hasSeenWelcome = localStorage.getItem('saudasetu-welcome-seen');
            if (!hasSeenWelcome) {
                setIsVisible(true);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('saudasetu-welcome-seen', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        🎉 SaudaSetu AI में आपका स्वागत है!
                    </h2>

                    <p className="text-gray-600 mb-6">
                        भारत का पहला AI-powered local market platform।
                        यहां आप multilingual translation, smart negotiation,
                        और fair pricing के साथ बेहतरीन deals कर सकते हैं।
                    </p>

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">🚀 Quick Start:</h3>
                        <ul className="text-sm text-gray-700 space-y-1 text-left">
                            <li>• Marketplace में products browse करें</li>
                            <li>• AI Chatbot से help लें (नीचे दाएं कोने में)</li>
                            <li>• Demo accounts से login करें</li>
                            <li>• Real-time negotiation try करें</li>
                        </ul>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                            शुरू करें
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeMessage;