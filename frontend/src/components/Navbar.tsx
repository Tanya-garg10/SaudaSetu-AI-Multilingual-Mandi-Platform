import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ShoppingCart, User, LogOut, Home, Store } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">SaudaSetu AI</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/marketplace"
              className="flex items-center space-x-1 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Marketplace</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'buyer' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;