import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsApi, negotiationsApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { MapPin, MessageCircle, ShoppingCart, User } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [showNegotiationModal, setShowNegotiationModal] = useState(false);
    const [negotiationData, setNegotiationData] = useState({
        price: '',
        quantity: 1,
        message: ''
    });

    const { data: productData, isLoading, error } = useQuery(
        ['product', id],
        () => productsApi.getProduct(id!),
        {
            enabled: !!id
        }
    );

    const product = productData?.data;

    const handleStartNegotiation = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!negotiationData.price || !negotiationData.message) {
            alert('कृपया सभी फील्ड भरें');
            return;
        }

        try {
            const response = await negotiationsApi.createNegotiation({
                productId: id!,
                initialOffer: {
                    price: Number(negotiationData.price),
                    quantity: negotiationData.quantity
                },
                message: negotiationData.message
            });

            if (response.success && response.data) {
                navigate(`/negotiation/${response.data._id}`);
            }
        } catch (error) {
            console.error('Error starting negotiation:', error);
            alert('बातचीत शुरू करने में समस्या हुई');
        }
    };

    if (isLoading) return <LoadingSpinner />;

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                    >
                        Back to Marketplace
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="aspect-w-1 aspect-h-1">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-96 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-400">No image available</span>
                                    </div>
                                )}
                            </div>

                            {/* Additional Images */}
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.images.slice(1, 5).map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`${product.name} ${index + 2}`}
                                            className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.category === 'vegetables' ? 'bg-green-100 text-green-800' :
                                        product.category === 'fruits' ? 'bg-orange-100 text-orange-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {product.category}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
                            </div>

                            {/* Price */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-3xl font-bold text-green-600">
                                                ₹{product.currentPrice}
                                            </span>
                                            <span className="text-lg text-gray-500">/{product.unit}</span>
                                        </div>
                                        {product.basePrice !== product.currentPrice && (
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-lg text-gray-400 line-through">₹{product.basePrice}</span>
                                                <span className="text-sm text-red-600 font-medium">
                                                    {Math.round(((product.basePrice - product.currentPrice) / product.basePrice) * 100)}% off
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Available</div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            {product.quantity} {product.unit}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vendor Info */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Vendor Information</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <User className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Vendor</div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {product.location.city}, {product.location.state}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {user && user.role === 'buyer' ? (
                                    <>
                                        <button
                                            onClick={() => setShowNegotiationModal(true)}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            <span>Start Negotiation</span>
                                        </button>
                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2">
                                            <ShoppingCart className="h-5 w-5" />
                                            <span>Buy Now</span>
                                        </button>
                                    </>
                                ) : user && user.role === 'vendor' ? (
                                    <div className="text-center py-4 text-gray-600">
                                        You are viewing this as a vendor
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                                    >
                                        Login to Buy or Negotiate
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Negotiation Modal */}
            {showNegotiationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Start Negotiation</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Offer Price (₹/{product.unit})
                                </label>
                                <input
                                    type="number"
                                    value={negotiationData.price}
                                    onChange={(e) => setNegotiationData(prev => ({ ...prev, price: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder={`Current price: ₹${product.currentPrice}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity ({product.unit})
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={product.quantity}
                                    value={negotiationData.quantity}
                                    onChange={(e) => setNegotiationData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message to Vendor
                                </label>
                                <textarea
                                    value={negotiationData.message}
                                    onChange={(e) => setNegotiationData(prev => ({ ...prev, message: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="मुझे यह प्रोडक्ट चाहिए..."
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowNegotiationModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStartNegotiation}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                                >
                                    Start Negotiation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;