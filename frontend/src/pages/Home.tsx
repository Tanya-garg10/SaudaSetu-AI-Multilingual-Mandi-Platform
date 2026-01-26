import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  MessageCircle, 
  TrendingUp, 
  Handshake, 
  Globe, 
  Shield, 
  Zap,
  ArrowRight,
  Users,
  BarChart3
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuthStore();

  const features = [
    {
      icon: <MessageCircle className="h-8 w-8 text-green-600" />,
      title: 'Real-time Translation',
      description: 'Communicate seamlessly in your preferred Indian language with automatic translation.'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      title: 'AI Price Discovery',
      description: 'Get fair market prices powered by AI analysis of local market trends.'
    },
    {
      icon: <Handshake className="h-8 w-8 text-purple-600" />,
      title: 'Smart Negotiation',
      description: 'AI-powered negotiation engine ensures fair deals for both buyers and vendors.'
    },
    {
      icon: <Globe className="h-8 w-8 text-orange-600" />,
      title: 'Local Market Focus',
      description: 'Designed specifically for Indian local markets with cultural understanding.'
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: 'Secure Platform',
      description: 'End-to-end security with verified users and secure payment integration.'
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: 'Real-time Updates',
      description: 'Live price updates, instant messaging, and real-time negotiation tracking.'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: <Users className="h-6 w-6" /> },
    { label: 'Successful Deals', value: '50,000+', icon: <Handshake className="h-6 w-6" /> },
    { label: 'Market Coverage', value: '500+ Cities', icon: <Globe className="h-6 w-6" /> },
    { label: 'Average Savings', value: '15%', icon: <BarChart3 className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Revolutionizing
              <span className="text-green-600"> Indian Local Markets</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect buyers and vendors across India with AI-powered translation, 
              smart price discovery, and intelligent negotiation tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/marketplace"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/marketplace"
                    className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold"
                  >
                    Browse Products
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full text-green-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Markets
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform brings traditional Indian markets into the digital age
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How SaudaSetu AI Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to connect and trade in your local market
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Browse & Discover</h3>
              <p className="text-gray-600">
                Explore products from local vendors with AI-powered price insights and market trends.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Negotiate Smart</h3>
              <p className="text-gray-600">
                Use our intelligent negotiation engine with real-time translation to communicate and negotiate fairly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Complete Deal</h3>
              <p className="text-gray-600">
                Finalize your purchase with secure payment and delivery coordination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Market Experience?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of buyers and vendors already using SaudaSetu AI to make smarter, fairer deals.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold"
              >
                Start Selling
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-lg text-lg font-semibold"
              >
                Start Buying
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;