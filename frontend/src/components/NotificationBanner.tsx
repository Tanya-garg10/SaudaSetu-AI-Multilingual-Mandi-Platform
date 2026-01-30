import React, { useState } from 'react';
import { X, Info } from 'lucide-react';

const NotificationBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                        <Info className="h-5 w-5" />
                        <p className="text-sm font-medium">
                            🎉 <strong>Demo Mode:</strong> यह एक demo platform है।
                            <span className="ml-2">
                                Login करने के लिए: <code className="bg-white bg-opacity-20 px-2 py-1 rounded">amit.kumar@example.com</code> / <code className="bg-white bg-opacity-20 px-2 py-1 rounded">password123</code>
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationBanner;