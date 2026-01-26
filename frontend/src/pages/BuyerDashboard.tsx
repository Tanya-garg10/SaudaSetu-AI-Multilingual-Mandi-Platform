import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { negotiationsApi, priceDiscoveryApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { 
  ShoppingCart, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Search
} from 'lucide-react';

const BuyerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: negotiations } = useQuery(
    'buyer-negotiations',
    () => negotiationsApi.getNegotiations({ limit: 10 })
  );

  const { data: trends } = useQuery(
    'market-trends',
    () => priceDiscoveryApi.getTrends({ 
      categories: 'vegetables,fruits,grains,spices',
      city: user?.location.city,
      state: user?.location.state
    })
  );

  const activeNegotiations = negotiations?.data?.negotiations?.filter(n => n.status === 'active') || [];
  const completedNegotiations = negotiations?.data?.negotiations?.filter(n => n.status === 'completed') || [];
  const totalSavings = completedNegotiations.reduce((sum, n) => {
    const product = n.productId as any;
    const savings = (product?.basePrice || 0) - (n.finalPrice || 0);
    return sum + (savings > 0 ? savings * (n.finalQuantity || 0) : 0);
  }, 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'negotiations', label: 'Negotiations', icon: <MessageCircle className="h-4 w-4" /> },
    { id: 'trends', label: 'Market Trends', icon: <TrendingUp className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Negotiations</p>
                <p className="text-2xl font-bold text-gray-900">{activeNegotiations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Deals</p>
                <p className="text-2xl font-bold text-gray-900">{completedNegotiations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalSavings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{completedNegotiations.length > 0 
                    ? (completedNegotiations.reduce((sum, n) => sum + (n.finalPrice || 0) * (n.finalQuantity || 0), 0) / completedNegotiations.length).toFixed(0)
                    : '0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/marketplace"
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              <Search className="h-4 w-4" />
              <span>Browse Products</span>
            </Link>
            <Link
              to="/marketplace?category=vegetables"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Fresh Vegetables</span>
            </Link>
            <Link
              to="/marketplace?category=fruits"
              className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Fresh Fruits</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  {negotiations?.data?.negotiations?.slice(0, 5).map((negotiation: any) => (
                    <div key={negotiation._id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          negotiation.status === 'active' ? 'bg-blue-100' :
                          negotiation.status === 'completed' ? 'bg-green-100' :
                          'bg-red-100'
                        }`}>
                          {negotiation.status === 'active' ? (
                            <Clock className="h-4 w-4 text-blue-600" />
                          ) : negotiation.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{negotiation.productId?.name}</p>
                          <p className="text-sm text-gray-500">
                            {negotiation.status === 'completed' 
                              ? `Completed at ₹${negotiation.finalPrice}/${negotiation.productId?.unit}`
                              : `Current offer: ₹${negotiation.currentOffer?.price}/${negotiation.productId?.unit}`
                            }
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/negotiation/${negotiation._id}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'negotiations' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">All Negotiations</h3>
                  <Link
                    to="/marketplace"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Start New Negotiation
                  </Link>
                </div>

                <div className="space-y-4">
                  {negotiations?.data?.negotiations?.map((negotiation: any) => (
                    <div key={negotiation._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{negotiation.productId?.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            negotiation.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            negotiation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {negotiation.status}
                          </span>
                        </div>
                        <Link
                          to={`/negotiation/${negotiation._id}`}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Vendor</p>
                          <p className="font-medium">{negotiation.vendorId?.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Current Offer</p>
                          <p className="font-medium">₹{negotiation.currentOffer?.price}/{negotiation.productId?.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Quantity</p>
                          <p className="font-medium">{negotiation.currentOffer?.quantity} {negotiation.productId?.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Updated</p>
                          <p className="font-medium">{new Date(negotiation.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Market Trends in {user?.location.city}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trends?.data?.map((trend: any) => (
                    <div key={trend.category} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 capitalize">{trend.category}</h4>
                        <span className={`flex items-center space-x-1 text-sm ${
                          trend.marketTrend === 'rising' ? 'text-red-600' :
                          trend.marketTrend === 'falling' ? 'text-green-600' :
                          'text-gray-600'
                        }`}>
                          <TrendingUp className={`h-4 w-4 ${
                            trend.marketTrend === 'falling' ? 'transform rotate-180' : ''
                          }`} />
                          <span>{trend.marketTrend}</span>
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Average Price:</span>
                          <span className="font-medium">₹{trend.averagePrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Price Range:</span>
                          <span className="font-medium">₹{trend.priceRange.min} - ₹{trend.priceRange.max}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Confidence:</span>
                          <span className="font-medium">{(trend.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;