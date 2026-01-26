import Negotiation from '../models/Negotiation';
import Product from '../models/Product';
import { priceDiscoveryService } from './priceDiscovery';

interface CounterOfferSuggestion {
  suggestedPrice: number;
  suggestedQuantity: number;
  reasoning: string;
  confidence: number;
}

class NegotiationEngine {
  async suggestCounterOffer(
    negotiationId: string,
    currentOfferPrice: number,
    currentOfferQuantity: number
  ): Promise<CounterOfferSuggestion | null> {
    try {
      const negotiation = await Negotiation.findById(negotiationId)
        .populate('productId');

      if (!negotiation) return null;

      const product = negotiation.productId as any;
      const marketData = await priceDiscoveryService.getPriceDiscovery(
        product.category,
        `${product.location.city}, ${product.location.state}`
      );

      // Calculate fair price based on market data and negotiation history
      const basePrice = product.currentPrice;
      const marketAverage = marketData.averagePrice;
      const offerRatio = currentOfferPrice / basePrice;

      let suggestedPrice: number;
      let reasoning: string;

      if (currentOfferPrice < marketData.priceRange.min) {
        // Offer is below market minimum
        suggestedPrice = Math.max(
          marketData.priceRange.min,
          basePrice * 0.85
        );
        reasoning = `Your offer is below market minimum (₹${marketData.priceRange.min}). Consider ₹${suggestedPrice} which is fair based on current market trends.`;
      } else if (currentOfferPrice > marketData.priceRange.max) {
        // Offer is above market maximum
        suggestedPrice = Math.min(
          marketData.priceRange.max,
          basePrice * 1.1
        );
        reasoning = `Your offer exceeds market maximum (₹${marketData.priceRange.max}). A fair price would be around ₹${suggestedPrice}.`;
      } else {
        // Offer is within market range, suggest based on negotiation pattern
        const negotiationProgress = negotiation.messages.length;
        const discountFactor = Math.min(0.15, negotiationProgress * 0.02);
        
        suggestedPrice = basePrice * (1 - discountFactor);
        reasoning = `Based on ${negotiationProgress} rounds of negotiation and current market trends, ₹${suggestedPrice} would be a fair compromise.`;
      }

      // Adjust quantity if needed
      let suggestedQuantity = currentOfferQuantity;
      if (currentOfferQuantity > product.quantity) {
        suggestedQuantity = product.quantity;
        reasoning += ` Note: Maximum available quantity is ${product.quantity} ${product.unit}.`;
      }

      // Calculate confidence based on market data quality
      const confidence = Math.min(0.95, marketData.confidence * 0.8 + 0.2);

      return {
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        suggestedQuantity,
        reasoning,
        confidence
      };
    } catch (error) {
      console.error('Negotiation engine error:', error);
      return null;
    }
  }

  async analyzeFairness(
    negotiationId: string
  ): Promise<{
    fairnessScore: number;
    analysis: string;
    recommendations: string[];
  } | null> {
    try {
      const negotiation = await Negotiation.findById(negotiationId)
        .populate(['productId', 'buyerId', 'vendorId']);

      if (!negotiation) return null;

      const product = negotiation.productId as any;
      const marketData = await priceDiscoveryService.getPriceDiscovery(
        product.category,
        `${product.location.city}, ${product.location.state}`
      );

      const currentPrice = negotiation.currentOffer.price;
      const basePrice = product.currentPrice;
      const marketAverage = marketData.averagePrice;

      // Calculate fairness score (0-1)
      let fairnessScore = 0.5; // Start neutral

      // Price fairness (40% weight)
      const priceDeviation = Math.abs(currentPrice - marketAverage) / marketAverage;
      const priceFairness = Math.max(0, 1 - priceDeviation * 2);
      fairnessScore += priceFairness * 0.4;

      // Negotiation balance (30% weight)
      const buyerMessages = negotiation.messages.filter(m => 
        m.senderId.toString() === negotiation.buyerId.toString()
      ).length;
      const vendorMessages = negotiation.messages.filter(m => 
        m.senderId.toString() === negotiation.vendorId.toString()
      ).length;
      
      const messageBalance = 1 - Math.abs(buyerMessages - vendorMessages) / 
        Math.max(buyerMessages + vendorMessages, 1);
      fairnessScore += messageBalance * 0.3;

      // Market trend consideration (30% weight)
      const trendFairness = marketData.marketTrend === 'stable' ? 1 : 
        marketData.marketTrend === 'rising' ? 0.7 : 0.8;
      fairnessScore += trendFairness * 0.3;

      // Generate analysis and recommendations
      let analysis = `Current offer of ₹${currentPrice} `;
      const recommendations: string[] = [];

      if (currentPrice < marketAverage * 0.9) {
        analysis += 'is below market average. ';
        recommendations.push('Consider increasing the offer to match market rates');
      } else if (currentPrice > marketAverage * 1.1) {
        analysis += 'is above market average. ';
        recommendations.push('Consider reducing the price to market levels');
      } else {
        analysis += 'is within fair market range. ';
      }

      if (messageBalance < 0.7) {
        recommendations.push('Encourage more balanced participation from both parties');
      }

      if (marketData.marketTrend === 'rising') {
        recommendations.push('Consider market is trending upward - prices may increase');
      } else if (marketData.marketTrend === 'falling') {
        recommendations.push('Market is trending downward - good time for buyers');
      }

      return {
        fairnessScore: Math.min(1, Math.max(0, fairnessScore)),
        analysis,
        recommendations
      };
    } catch (error) {
      console.error('Fairness analysis error:', error);
      return null;
    }
  }

  async getOptimalPrice(
    productId: string,
    quantity: number
  ): Promise<{
    optimalPrice: number;
    priceRange: { min: number; max: number };
    reasoning: string;
  } | null> {
    try {
      const product = await Product.findById(productId);
      if (!product) return null;

      const marketData = await priceDiscoveryService.getPriceDiscovery(
        product.category,
        `${product.location.city}, ${product.location.state}`
      );

      // Calculate optimal price based on quantity and market conditions
      let optimalPrice = marketData.averagePrice;
      
      // Bulk discount for large quantities
      if (quantity > product.quantity * 0.5) {
        optimalPrice *= 0.95; // 5% bulk discount
      }

      // Adjust for market trends
      if (marketData.marketTrend === 'rising') {
        optimalPrice *= 1.05;
      } else if (marketData.marketTrend === 'falling') {
        optimalPrice *= 0.95;
      }

      const priceRange = {
        min: Math.max(marketData.priceRange.min, product.currentPrice * 0.8),
        max: Math.min(marketData.priceRange.max, product.currentPrice * 1.2)
      };

      let reasoning = `Optimal price calculated based on market average (₹${marketData.averagePrice}), `;
      reasoning += `current trend (${marketData.marketTrend}), `;
      reasoning += `and quantity requested (${quantity} ${product.unit}).`;

      return {
        optimalPrice: Math.round(optimalPrice * 100) / 100,
        priceRange,
        reasoning
      };
    } catch (error) {
      console.error('Optimal price calculation error:', error);
      return null;
    }
  }
}

export const negotiationEngine = new NegotiationEngine();