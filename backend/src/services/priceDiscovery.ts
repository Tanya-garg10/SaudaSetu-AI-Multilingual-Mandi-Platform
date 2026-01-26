import Product from '../models/Product';
import Negotiation from '../models/Negotiation';

interface PriceDiscoveryData {
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

interface PriceHistoryPoint {
  date: Date;
  averagePrice: number;
  volume: number;
}

class PriceDiscoveryService {
  private cache: Map<string, { data: PriceDiscoveryData; expiry: Date }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  async getPriceDiscovery(
    category: string,
    location?: string
  ): Promise<PriceDiscoveryData> {
    const cacheKey = `${category}-${location || 'all'}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > new Date()) {
      return cached.data;
    }

    const data = await this.calculatePriceDiscovery(category, location);
    this.cache.set(cacheKey, {
      data,
      expiry: new Date(Date.now() + this.CACHE_DURATION)
    });

    return data;
  }

  private async calculatePriceDiscovery(
    category: string,
    location?: string
  ): Promise<PriceDiscoveryData> {
    try {
      // Build query filter
      const filter: any = { category, isActive: true };
      if (location) {
        const [city, state] = location.split(',').map(s => s.trim());
        if (city) filter['location.city'] = new RegExp(city, 'i');
        if (state) filter['location.state'] = new RegExp(state, 'i');
      }

      // Get current products
      const products = await Product.find(filter);
      
      if (products.length === 0) {
        return this.getDefaultPriceData(category, location || 'Unknown');
      }

      // Calculate current price statistics
      const prices = products.map(p => p.currentPrice);
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      // Get historical data for trend analysis
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const historicalProducts = await Product.find({
        ...filter,
        updatedAt: { $gte: thirtyDaysAgo }
      }).sort({ updatedAt: 1 });

      // Calculate trend
      const marketTrend = this.calculateTrend(historicalProducts);

      // Get negotiation data for confidence calculation
      const recentNegotiations = await Negotiation.find({
        productId: { $in: products.map(p => p._id) },
        status: 'completed',
        updatedAt: { $gte: thirtyDaysAgo }
      });

      // Calculate confidence based on data volume and recency
      const confidence = this.calculateConfidence(
        products.length,
        recentNegotiations.length,
        historicalProducts.length
      );

      return {
        productCategory: category,
        location: location || 'All locations',
        averagePrice: Math.round(averagePrice * 100) / 100,
        priceRange: {
          min: Math.round(minPrice * 100) / 100,
          max: Math.round(maxPrice * 100) / 100
        },
        marketTrend,
        confidence,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Price discovery calculation error:', error);
      return this.getDefaultPriceData(category, location || 'Unknown');
    }
  }

  private calculateTrend(historicalProducts: any[]): 'rising' | 'falling' | 'stable' {
    if (historicalProducts.length < 5) return 'stable';

    // Group by week and calculate average prices
    const weeklyPrices: { [key: string]: number[] } = {};
    
    historicalProducts.forEach(product => {
      const weekKey = this.getWeekKey(product.updatedAt);
      if (!weeklyPrices[weekKey]) weeklyPrices[weekKey] = [];
      weeklyPrices[weekKey].push(product.currentPrice);
    });

    const weeks = Object.keys(weeklyPrices).sort();
    if (weeks.length < 2) return 'stable';

    const weeklyAverages = weeks.map(week => {
      const prices = weeklyPrices[week];
      return prices.reduce((sum, price) => sum + price, 0) / prices.length;
    });

    // Calculate trend using linear regression
    const n = weeklyAverages.length;
    const sumX = weeks.reduce((sum, _, i) => sum + i, 0);
    const sumY = weeklyAverages.reduce((sum, price) => sum + price, 0);
    const sumXY = weeklyAverages.reduce((sum, price, i) => sum + i * price, 0);
    const sumXX = weeks.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgPrice = sumY / n;

    // Determine trend based on slope significance
    const trendThreshold = avgPrice * 0.02; // 2% threshold

    if (slope > trendThreshold) return 'rising';
    if (slope < -trendThreshold) return 'falling';
    return 'stable';
  }

  private calculateConfidence(
    currentProducts: number,
    recentNegotiations: number,
    historicalDataPoints: number
  ): number {
    let confidence = 0.5; // Base confidence

    // More current products = higher confidence
    confidence += Math.min(0.3, currentProducts * 0.02);

    // Recent negotiations add confidence
    confidence += Math.min(0.15, recentNegotiations * 0.01);

    // Historical data adds confidence
    confidence += Math.min(0.05, historicalDataPoints * 0.001);

    return Math.min(0.95, Math.max(0.1, confidence));
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = Math.floor((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week}`;
  }

  private getDefaultPriceData(category: string, location: string): PriceDiscoveryData {
    // Default price ranges for different categories (in INR)
    const defaultPrices: { [key: string]: { min: number; max: number; avg: number } } = {
      vegetables: { min: 20, max: 80, avg: 45 },
      fruits: { min: 30, max: 150, avg: 75 },
      grains: { min: 25, max: 60, avg: 40 },
      spices: { min: 100, max: 500, avg: 250 },
      dairy: { min: 40, max: 120, avg: 70 },
      meat: { min: 200, max: 600, avg: 350 },
      fish: { min: 150, max: 400, avg: 250 },
      pulses: { min: 60, max: 150, avg: 90 },
      oils: { min: 80, max: 200, avg: 120 },
      others: { min: 50, max: 200, avg: 100 }
    };

    const priceData = defaultPrices[category] || defaultPrices.others;

    return {
      productCategory: category,
      location,
      averagePrice: priceData.avg,
      priceRange: {
        min: priceData.min,
        max: priceData.max
      },
      marketTrend: 'stable',
      confidence: 0.3, // Low confidence for default data
      lastUpdated: new Date()
    };
  }

  async getPriceHistory(
    category: string,
    location?: string,
    days: number = 30
  ): Promise<PriceHistoryPoint[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const filter: any = { 
        category, 
        isActive: true,
        updatedAt: { $gte: startDate }
      };
      
      if (location) {
        const [city, state] = location.split(',').map(s => s.trim());
        if (city) filter['location.city'] = new RegExp(city, 'i');
        if (state) filter['location.state'] = new RegExp(state, 'i');
      }

      const products = await Product.find(filter).sort({ updatedAt: 1 });

      // Group by day
      const dailyData: { [key: string]: { prices: number[]; count: number } } = {};
      
      products.forEach(product => {
        const dayKey = product.updatedAt.toISOString().split('T')[0];
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = { prices: [], count: 0 };
        }
        dailyData[dayKey].prices.push(product.currentPrice);
        dailyData[dayKey].count++;
      });

      return Object.entries(dailyData)
        .map(([date, data]) => ({
          date: new Date(date),
          averagePrice: data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length,
          volume: data.count
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error('Price history error:', error);
      return [];
    }
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache(): void {
    this.cache.clear();
  }
}

export const priceDiscoveryService = new PriceDiscoveryService();