import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    BarChart3,
    Globe,
    AlertTriangle,
    CheckCircle,
    Clock,
    DollarSign,
    Package,
    Users,
    Lightbulb
} from 'lucide-react';
import { priceDiscoveryApi, translationApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface MarketInsight {
    category: string;
    currentPrice: number;
    trend: 'rising' | 'falling' | 'stable';
    change: number;
    confidence: number;
    recommendations: string[];
    demandLevel: 'high' | 'medium' | 'low';
    supplyStatus: 'abundant' | 'normal' | 'scarce';
    seasonalFactor: number;
}

interface PriceAlert {
    category: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: Date;
}

const AIMarketInsights: React.FC = () => {
    const { user } = useAuthStore();
    const [insights, setInsights] = useState<MarketInsight[]>([]);
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('vegetables');
    const [loading, setLoading] = useState(false);
    const [translatedInsights, setTranslatedInsights] = useState<Record<string, string>>({});

    const categories = [
        { id: 'vegetables', name: 'Vegetables', icon: '🥬', color: 'green' },
        { id: 'fruits', name: 'Fruits', icon: '🍎', color: 'red' },
        { id: 'grains', name: 'Grains', icon: '🌾', color: 'yellow' },
        { id: 'spices', name: 'Spices', icon: '🌶️', color: 'orange' },
        { id: 'dairy', name: 'Dairy', icon: '🥛', color: 'blue' },
        { id: 'others', name: 'Others', icon: '📦', color: 'gray' }
    ];

    useEffect(() => {
        fetchMarketInsights();
        fetchPriceAlerts();

        // Refresh insights every 5 minutes
        const interval = setInterval(() => {
            fetchMarketInsights();
            fetchPriceAlerts();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const fetchMarketInsights = async () => {
        setLoading(true);
        try {
            const categoryPromises = categories.map(async (category) => {
                const trends = await priceDiscoveryApi.getTrends({
                    categories: category.id,
                    city: user?.location?.city,
                    state: user?.location?.state
                });

                if (trends.data && trends.data.length > 0) {
                    const categoryData = trends.data[0];
                    return {
                        category: category.id,
                        currentPrice: categoryData.currentPrice || 0,
                        trend: categoryData.trend || 'stable',
                        change: categoryData.change || 0,
                        confidence: categoryData.confidence || 0.5,
                        recommendations: [
                            'Monitor price trends closely',
                            'Consider bulk purchases for better rates',
                            'Check seasonal availability'
                        ],
                        demandLevel: 'medium' as const,
                        supplyStatus: 'normal' as const,
                        seasonalFactor: 1.0
                    };
                }
                return null;
            });

            const results = await Promise.all(categoryPromises);
            setInsights(results.filter(Boolean) as MarketInsight[]);

            // Translate insights if user prefers non-English
            if (user?.preferredLanguage && user.preferredLanguage !== 'en') {
                translateInsights(results.filter(Boolean) as MarketInsight[]);
            }

        } catch (error) {
            console.error('Error fetching market insights:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPriceAlerts = async () => {
        try {
            // Simulate price alerts - in real app, this would come from backend
            const mockAlerts: PriceAlert[] = [
                {
                    category: 'vegetables',
                    message: 'Tomato prices increased by 15% due to seasonal demand',
                    severity: 'high',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
                },
                {
                    category: 'fruits',
                    message: 'Mango season starting - prices expected to drop',
                    severity: 'medium',
                    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
                },
                {
                    category: 'grains',
                    message: 'Rice supply stable across major markets',
                    severity: 'low',
                    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
                }
            ];

            setAlerts(mockAlerts);
        } catch (error) {
            console.error('Error fetching price alerts:', error);
        }
    };

    const translateInsights = async (insightData: MarketInsight[]) => {
        try {
            const translations: Record<string, string> = {};

            for (const insight of insightData) {
                for (const recommendation of insight.recommendations) {
                    if (!translations[recommendation]) {
                        const result = await translationApi.translate({
                            text: recommendation,
                            fromLanguage: 'en',
                            toLanguage: user?.preferredLanguage || 'hi'
                        });
                        if (result.data) {
                            translations[recommendation] = result.data.translatedText;
                        }
                    }
                }
            }

            setTranslatedInsights(translations);
        } catch (error) {
            console.error('Translation error:', error);
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'rising':
                return <TrendingUp className="h-4 w-4 text-red-500" />;
            case 'falling':
                return <TrendingDown className="h-4 w-4 text-green-500" />;
            default:
                return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'rising':
                return 'text-red-600 bg-red-50';
            case 'falling':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getAlertIcon = (severity: string) => {
        switch (severity) {
            case 'high':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'medium':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            default:
                return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
    };

    const selectedInsight = insights.find(i => i.category === selectedCategory);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
                    AI Market Insights
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Globe className="h-4 w-4" />
                    <span>Real-time Analysis</span>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex space-x-1 mb-6 overflow-x-auto">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedCategory === category.id
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <span>{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Market Overview */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Market Overview</h3>

                        {selectedInsight ? (
                            <div className="space-y-4">
                                {/* Price Card */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-600">Average Price</span>
                                        <div className="flex items-center space-x-1">
                                            {getTrendIcon(selectedInsight.trend)}
                                            <span className={`text-sm font-medium ${getTrendColor(selectedInsight.trend).split(' ')[0]}`}>
                                                {selectedInsight.change > 0 ? '+' : ''}{selectedInsight.change}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        ₹{selectedInsight.currentPrice.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Confidence: {(selectedInsight.confidence * 100).toFixed(0)}%
                                    </div>
                                </div>

                                {/* Market Indicators */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Users className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm font-medium text-gray-700">Demand</span>
                                        </div>
                                        <div className={`text-sm font-semibold capitalize ${selectedInsight.demandLevel === 'high' ? 'text-red-600' :
                                            selectedInsight.demandLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                            }`}>
                                            {selectedInsight.demandLevel}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Package className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium text-gray-700">Supply</span>
                                        </div>
                                        <div className={`text-sm font-semibold capitalize ${selectedInsight.supplyStatus === 'scarce' ? 'text-red-600' :
                                            selectedInsight.supplyStatus === 'normal' ? 'text-yellow-600' : 'text-green-600'
                                            }`}>
                                            {selectedInsight.supplyStatus}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Recommendations */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                        <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
                                        AI Recommendations
                                    </h4>
                                    <ul className="space-y-2">
                                        {selectedInsight.recommendations.map((rec, index) => (
                                            <li key={index} className="flex items-start space-x-2 text-sm">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <span className="text-gray-600">
                                                    {user?.preferredLanguage !== 'en' && translatedInsights[rec]
                                                        ? translatedInsights[rec]
                                                        : rec}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No data available for this category</p>
                            </div>
                        )}
                    </div>

                    {/* Price Alerts */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Price Alerts</h3>

                        <div className="space-y-3">
                            {alerts.map((alert, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border-l-4 ${alert.severity === 'high' ? 'bg-red-50 border-red-400' :
                                        alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                                            'bg-green-50 border-green-400'
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        {getAlertIcon(alert.severity)}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-900 capitalize">
                                                    {alert.category}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">{alert.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span>Set Price Alert</span>
                                </button>
                                <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm">
                                    <BarChart3 className="h-4 w-4 text-blue-600" />
                                    <span>View Trends</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIMarketInsights;