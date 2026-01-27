export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: 'buyer' | 'vendor';
    preferredLanguage: string;
    location: {
        city: string;
        state: string;
        coordinates: [number, number];
    };
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    _id: string;
    vendorId: string;
    name: string;
    description: string;
    category: string;
    basePrice: number;
    currentPrice: number;
    unit: string;
    quantity: number;
    images: string[];
    location: {
        city: string;
        state: string;
        coordinates: [number, number];
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Negotiation {
    _id: string;
    productId: string;
    buyerId: string;
    vendorId: string;
    status: 'active' | 'completed' | 'cancelled';
    messages: NegotiationMessage[];
    currentOffer: {
        price: number;
        quantity: number;
        proposedBy: string;
    };
    finalPrice?: number;
    finalQuantity?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface NegotiationMessage {
    _id: string;
    senderId: string;
    message: string;
    translatedMessage?: string;
    offerPrice?: number;
    offerQuantity?: number;
    timestamp: Date;
}

export interface PriceDiscovery {
    productCategory: string;
    location: string;
    averagePrice: number;
    priceRange: {
        min: number;
        max: number;
    };
    marketTrend: 'rising' | 'falling' | 'stable';
    confidence: number;
    lastUpdated: Date;
}

export interface TranslationRequest {
    text: string;
    fromLanguage: string;
    toLanguage: string;
}

export interface TranslationResponse {
    translatedText: string;
    confidence: number;
}

export const SUPPORTED_LANGUAGES = {
    'hi': 'Hindi',
    'en': 'English',
    'bn': 'Bengali',
    'te': 'Telugu',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'or': 'Odia',
    'as': 'Assamese'
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;