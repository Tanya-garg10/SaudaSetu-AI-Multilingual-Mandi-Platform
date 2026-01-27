import axios from 'axios';
import {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Product,
  Negotiation,
  TranslationRequest,
  TranslationResponse
} from '../types/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    api.post('/auth/login', data).then(res => res.data),

  register: (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> =>
    api.post('/auth/register', data).then(res => res.data),

  getMe: (): Promise<ApiResponse<User>> =>
    api.get('/auth/me').then(res => res.data),
};

// Products API
export const productsApi = {
  getProducts: (params?: any): Promise<ApiResponse<{ products: Product[]; pagination: any }>> =>
    api.get('/products', { params }).then(res => res.data),

  getProduct: (id: string): Promise<ApiResponse<Product>> =>
    api.get(`/products/${id}`).then(res => res.data),

  createProduct: (data: Partial<Product>): Promise<ApiResponse<Product>> =>
    api.post('/products', data).then(res => res.data),

  updateProduct: (id: string, data: Partial<Product>): Promise<ApiResponse<Product>> =>
    api.put(`/products/${id}`, data).then(res => res.data),

  deleteProduct: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/products/${id}`).then(res => res.data),
};

// Negotiations API
export const negotiationsApi = {
  getNegotiations: (params?: any): Promise<ApiResponse<{ negotiations: Negotiation[]; pagination: any }>> =>
    api.get('/negotiations', { params }).then(res => res.data),

  getNegotiation: (id: string): Promise<ApiResponse<Negotiation>> =>
    api.get(`/negotiations/${id}`).then(res => res.data),

  createNegotiation: (data: {
    productId: string;
    initialOffer: { price: number; quantity: number };
    message: string;
  }): Promise<ApiResponse<Negotiation>> =>
    api.post('/negotiations', data).then(res => res.data),

  addMessage: (id: string, data: {
    message: string;
    offerPrice?: number;
    offerQuantity?: number;
  }): Promise<ApiResponse<any>> =>
    api.post(`/negotiations/${id}/messages`, data).then(res => res.data),

  completeNegotiation: (id: string): Promise<ApiResponse<Negotiation>> =>
    api.post(`/negotiations/${id}/complete`).then(res => res.data),

  cancelNegotiation: (id: string): Promise<ApiResponse<Negotiation>> =>
    api.post(`/negotiations/${id}/cancel`).then(res => res.data),
};

// Price Discovery API
export const priceDiscoveryApi = {
  getPriceDiscovery: (params: {
    category: string;
    city?: string;
    state?: string;
  }): Promise<ApiResponse<any>> =>
    api.get('/price-discovery', { params }).then(res => res.data),

  getTrends: (params: {
    categories: string;
    city?: string;
    state?: string;
  }): Promise<ApiResponse<any[]>> =>
    api.get('/price-discovery/trends', { params }).then(res => res.data),

  getPriceHistory: (params: {
    category: string;
    city?: string;
    state?: string;
    days?: number;
  }): Promise<ApiResponse<any[]>> =>
    api.get('/price-discovery/history', { params }).then(res => res.data),

  comparePrices: (params: {
    category: string;
    locations: string;
  }): Promise<ApiResponse<any[]>> =>
    api.get('/price-discovery/compare', { params }).then(res => res.data),
};

// Translation API
export const translationApi = {
  translate: (data: TranslationRequest): Promise<ApiResponse<TranslationResponse>> =>
    api.post('/translation/translate', data).then(res => res.data),

  getSupportedLanguages: (): Promise<ApiResponse<any>> =>
    api.get('/translation/languages').then(res => res.data),

  detectLanguage: (text: string): Promise<ApiResponse<{ language: string; confidence: number }>> =>
    api.post('/translation/detect', { text }).then(res => res.data),
};

export default api;