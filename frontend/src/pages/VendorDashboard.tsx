import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { productsApi, negotiationsApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { 
  Plus, 
  Package, 
  MessageCircle, 
  TrendingUp, 
  Edit, 
  Trash2,
  Eye,
  BarChart3,
  DollarSign,
  Users
} from 'lucide-react';

const VendorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const queryClient = useQueryClient();

  const { data: products } = useQuery(
    'vendor-products',
    () => productsApi.getProducts({ vendorId: user?._id })
  );

  const { data: negotiations } = useQuery(
    'vendor-negotiations',
    () => negotiationsApi.getNegotiations({ limit: 10 })
  );

  const deleteProductMutation = useMutation(
    (productId: string) => productsApi.deleteProduct(productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vendor-products');
        toast.success('Product deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete product');
      }
    }
  );

  const activeProducts = products?.data?.products?.filter(p => p.isActive) || [];
  const activeNegotiations = negotiations?.data?.negotiations?.filter(n => n.status === 'active') || [];
  const completedNegotiations = negotiations?.data?.negotiations?.filter(n => n.status === 'completed') || [];
  const totalRevenue = completedNegotiations.reduce((sum, n) => sum + (n.finalPrice || 0) * (n.finalQuantity || 0), 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'products', label: 'My Products', icon: <Package className="h-4 w-4" /> },
    { id: 'negotiations', label: 'Negotiations', icon: <MessageCircle className="h-4 w-4" /> }
  ];

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{activeProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Negotiations</p>
                <p className="text-2xl font-bold text-gray-900">{activeNegotiations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Deals</p>
                <p className="text-2xl font-bold text-gray-900">{completedNegotiations.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
            </button>
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              <TrendingUp className="h-4 w-4" />
              <span>View Analytics</span>
            </button>
            <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
              <MessageCircle className="h-4 w-4" />
              <span>Check Messages</span>
            </button>
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
                          <MessageCircle className={`h-4 w-4 ${
                            negotiation.status === 'active' ? 'text-blue-600' :
                            negotiation.status === 'completed' ? 'text-green-600' :
                            'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{negotiation.productId?.name}</p>
                          <p className="text-sm text-gray-500">
                            Buyer: {negotiation.buyerId?.name} • 
                            {negotiation.status === 'completed' 
                              ? ` Sold at ₹${negotiation.finalPrice}/${negotiation.productId?.unit}`
                              : ` Offer: ₹${negotiation.currentOffer?.price}/${negotiation.productId?.unit}`
                            }
                          </p>
                        </div>
                      </div>
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        View
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Products</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeProducts.slice(0, 3).map((product: any) => (
                      <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{product.name}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Price:</span>
                            <span className="font-medium">₹{product.currentPrice}/{product.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Available:</span>
                            <span className="font-medium">{product.quantity} {product.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Category:</span>
                            <span className="font-medium capitalize">{product.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">My Products</h3>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products?.data?.products?.map((product: any) => (
                    <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Price:</span>
                            <span className="font-medium">₹{product.currentPrice}/{product.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Available:</span>
                            <span className="font-medium">{product.quantity} {product.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Category:</span>
                            <span className="font-medium capitalize">{product.category}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm">
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                          <button className="flex-1 flex items-center justify-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm">
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'negotiations' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">All Negotiations</h3>
                
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
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          View Details
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Buyer</p>
                          <p className="font-medium">{negotiation.buyerId?.name}</p>
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
          </div>
        </div>
      </div>

      {/* Add Product Modal - Placeholder */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Product</h3>
            <p className="text-gray-600 mb-4">Product creation form would go here.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddProduct(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddProduct(false)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;