import Product from '../models/Product';
import Negotiation from '../models/Negotiation';
import { SupportedLanguage } from '../types/shared';

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
  aiInsights: {
    seasonalFactor: number;
    demandLevel: 'high' | 'medium' | 'low';
    supplyStatus: 'abundant' | 'normal' | 'scarce';
    priceVolatility: 'high' | 'medium' | 'low';
    recommendations: string[];
  };
  predictedPrices: {
    nextWeek: number;
    nextMonth: number;
    confidence: number;
  };
}

interface PriceHistoryPoint {
  date: Date;
  averagePrice: number;
  volume: number;
  trend: 'rising' | 'falling' | 'stable';
}

interface MarketAnalysis {
  category: string;
  currentPrice: number;
  previousPrice: number;
  changePercentage: number;
  trend: 'rising' | 'falling' | 'stable';
  factors: string[];
  seasonalImpact: string;
  demandSupplyBalance: string;
}

class PriceDiscoveryService {
  private cache: Map<string, { data: PriceDiscoveryData; expiry: Date }> = new Map();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for real-time data

  // Seasonal factors for different categories and months
  private seasonalFactors: Record<string, Record<number, { factor: number; reason: string }>> = {
    'vegetables': {
      1: { factor: 1.2, reason: 'Winter demand, limited supply' },
      2: { factor: 1.15, reason: 'Cold weather affects production' },
      3: { factor: 0.9, reason: 'Spring harvest begins' },
      4: { factor: 0.8, reason: 'Peak harvest season' },
      5: { factor: 0.85, reason: 'Good supply availability' },
      6: { factor: 1.0, reason: 'Pre-monsoon normal prices' },
      7: { factor: 1.15, reason: 'Monsoon supply disruption' },
      8: { factor: 1.1, reason: 'Continued monsoon impact' },
      9: { factor: 0.95, reason: 'Post-monsoon recovery' },
      10: { factor: 0.9, reason: 'Festival season harvest' },
      11: { factor: 1.0, reason: 'Normal market conditions' },
      12: { factor: 1.1, reason: 'Winter demand increases' }
    },
    'fruits': {
      1: { factor: 1.3, reason: 'Winter fruit premium pricing' },
      2: { factor: 1.25, reason: 'Limited seasonal variety' },
      3: { factor: 0.9, reason: 'Spring fruits arrive' },
      4: { factor: 0.7, reason: 'Mango season begins' },
      5: { factor: 0.6, reason: 'Peak mango and summer fruits' },
      6: { factor: 0.8, reason: 'Summer fruit abundance' },
      7: { factor: 1.0, reason: 'Monsoon affects transport' },
      8: { factor: 1.1, reason: 'Limited fresh supply' },
      9: { factor: 0.95, reason: 'Post-monsoon fruits' },
      10: { factor: 0.85, reason: 'Festival season abundance' },
      11: { factor: 1.0, reason: 'Normal supply levels' },
      12: { factor: 1.15, reason: 'Winter fruit demand' }
    },
    'grains': {
      1: { factor: 1.0, reason: 'Stable grain market' },
      2: { factor: 1.05, reason: 'Pre-harvest demand' },
      3: { factor: 1.1, reason: 'Harvest preparation' },
      4: { factor: 0.9, reason: 'Rabi harvest season' },
      5: { factor: 0.85, reason: 'Peak harvest supply' },
      6: { factor: 0.9, reason: 'Good market availability' },
      7: { factor: 0.95, reason: 'Monsoon sowing period' },
      8: { factor: 1.0, reason: 'Normal market demand' },
      9: { factor: 1.05, reason: 'Festival season demand' },
      10: { factor: 0.9, reason: 'Kharif harvest begins' },
      11: { factor: 0.85, reason: 'Peak Kharif supply' },
      12: { factor: 0.95, reason: 'Year-end demand' }
    },
    'spices': {
      1: { factor: 1.1, reason: 'Winter cooking demand' },
      2: { factor: 1.05, reason: 'Steady consumption' },
      3: { factor: 1.0, reason: 'Normal market prices' },
      4: { factor: 0.95, reason: 'New harvest arrives' },
      5: { factor: 0.9, reason: 'Peak harvest season' },
      6: { factor: 0.95, reason: 'Good supply levels' },
      7: { factor: 1.0, reason: 'Monsoon storage needs' },
      8: { factor: 1.05, reason: 'Quality preservation costs' },
      9: { factor: 1.1, reason: 'Festival preparation' },
      10: { factor: 1.2, reason: 'Peak festival demand' },
      11: { factor: 1.15, reason: 'Wedding season demand' },
      12: { factor: 1.1, reason: 'Winter cooking increase' }
    }
  };

  async getPriceDiscovery(
    category: string,
    location?: string,
    language: SupportedLanguage = 'en'
  ): Promise<PriceDiscoveryData> {
    const cacheKey = `${category}-${location || 'all'}-${language}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > new Date()) {
      return cached.data;
    }

    const data = await this.calculateAdvancedPriceDiscovery(category, location, language);
    this.cache.set(cacheKey, {
      data,
      expiry: new Date(Date.now() + this.CACHE_DURATION)
    });

    return data;
  }

  private async calculateAdvancedPriceDiscovery(
    category: string,
    location?: string,
    language: SupportedLanguage = 'en'
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
        return this.getDefaultPriceData(category, location || 'Unknown', language);
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

      // Calculate advanced trend
      const marketTrend = this.calculateAdvancedTrend(historicalProducts);

      // Get negotiation data for market insights
      const recentNegotiations = await Negotiation.find({
        productId: { $in: products.map(p => p._id) },
        updatedAt: { $gte: thirtyDaysAgo }
      });

      // Calculate AI insights
      const aiInsights = this.generateAIInsights(
        category,
        products,
        recentNegotiations,
        averagePrice,
        language
      );

      // Predict future prices
      const predictedPrices = this.predictFuturePrices(
        category,
        averagePrice,
        marketTrend,
        aiInsights.seasonalFactor
      );

      // Calculate confidence
      const confidence = this.calculateAdvancedConfidence(
        products.length,
        recentNegotiations.length,
        historicalProducts.length,
        aiInsights.priceVolatility
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
        lastUpdated: new Date(),
        aiInsights,
        predictedPrices
      };
    } catch (error) {
      console.error('Advanced price discovery calculation error:', error);
      return this.getDefaultPriceData(category, location || 'Unknown', language);
    }
  }

  private calculateAdvancedTrend(historicalProducts: any[]): 'rising' | 'falling' | 'stable' {
    if (historicalProducts.length < 5) return 'stable';

    // Use weighted moving average for better trend detection
    const recentProducts = historicalProducts.slice(-14); // Last 14 data points
    const olderProducts = historicalProducts.slice(-28, -14); // Previous 14 data points

    if (recentProducts.length === 0 || olderProducts.length === 0) return 'stable';

    const recentAvg = recentProducts.reduce((sum, p) => sum + p.currentPrice, 0) / recentProducts.length;
    const olderAvg = olderProducts.reduce((sum, p) => sum + p.currentPrice, 0) / olderProducts.length;

    const changePercentage = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (changePercentage > 3) return 'rising';
    if (changePercentage < -3) return 'falling';
    return 'stable';
  }

  private generateAIInsights(
    category: string,
    products: any[],
    negotiations: any[],
    averagePrice: number,
    language: SupportedLanguage
  ) {
    const currentMonth = new Date().getMonth() + 1;
    const seasonalData = this.seasonalFactors[category]?.[currentMonth] || { factor: 1.0, reason: 'Normal conditions' };

    // Calculate demand level based on negotiations
    const negotiationRate = negotiations.length / products.length;
    const demandLevel: 'high' | 'medium' | 'low' =
      negotiationRate > 0.7 ? 'high' :
        negotiationRate > 0.3 ? 'medium' : 'low';

    // Calculate supply status based on product availability
    const avgQuantity = products.reduce((sum, p) => sum + p.quantity, 0) / products.length;
    const supplyStatus: 'abundant' | 'normal' | 'scarce' =
      avgQuantity > 100 ? 'abundant' :
        avgQuantity > 50 ? 'normal' : 'scarce';

    // Calculate price volatility
    const prices = products.map(p => p.currentPrice);
    const priceStdDev = this.calculateStandardDeviation(prices);
    const volatilityRatio = priceStdDev / averagePrice;
    const priceVolatility: 'high' | 'medium' | 'low' =
      volatilityRatio > 0.3 ? 'high' :
        volatilityRatio > 0.15 ? 'medium' : 'low';

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      demandLevel,
      supplyStatus,
      priceVolatility,
      seasonalData.factor,
      language
    );

    return {
      seasonalFactor: seasonalData.factor,
      demandLevel,
      supplyStatus,
      priceVolatility,
      recommendations
    };
  }

  private calculateStandardDeviation(values: number[]): number {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private generateRecommendations(
    demandLevel: string,
    supplyStatus: string,
    priceVolatility: string,
    seasonalFactor: number,
    language: SupportedLanguage
  ): string[] {
    const recommendations: string[] = [];

    // Demand-based recommendations
    if (demandLevel === 'high' && supplyStatus === 'scarce') {
      recommendations.push(this.translateRecommendation(
        'High demand with limited supply. Expect price increases. Consider bulk buying.',
        language
      ));
    } else if (demandLevel === 'low' && supplyStatus === 'abundant') {
      recommendations.push(this.translateRecommendation(
        'Low demand with good supply. Great time to negotiate better prices.',
        language
      ));
    }

    // Volatility-based recommendations
    if (priceVolatility === 'high') {
      recommendations.push(this.translateRecommendation(
        'High price volatility detected. Compare multiple vendors before buying.',
        language
      ));
    }

    // Seasonal recommendations
    if (seasonalFactor > 1.1) {
      recommendations.push(this.translateRecommendation(
        'Seasonal price increase period. Consider alternative products or bulk storage.',
        language
      ));
    } else if (seasonalFactor < 0.9) {
      recommendations.push(this.translateRecommendation(
        'Seasonal price advantage. Excellent time for bulk purchases.',
        language
      ));
    }

    // General market recommendations
    recommendations.push(this.translateRecommendation(
      'Use AI negotiation assistant for better deals and fair pricing.',
      language
    ));

    return recommendations;
  }

  private translateRecommendation(text: string, language: SupportedLanguage): string {
    // Basic translation for key recommendations
    const translations: Record<string, Record<SupportedLanguage, string>> = {
      'High demand with limited supply. Expect price increases. Consider bulk buying.': {
        'hi': 'उच्च मांग और सीमित आपूर्ति। कीमत बढ़ने की उम्मीद। थोक खरीदारी पर विचार करें।',
        'bn': 'উচ্চ চাহিদা এবং সীমিত সরবরাহ। দাম বৃদ্ধির প্রত্যাশা। বাল্ক কেনার কথা ভাবুন।',
        'te': 'అధిక డిమాండ్ మరియు పరిమిత సరఫరా. ధర పెరుగుదల ఆశించండి. బల్క్ కొనుగోలు పరిగణించండి.',
        'mr': 'उच्च मागणी आणि मर्यादित पुरवठा. किंमत वाढीची अपेक्षा. मोठ्या प्रमाणात खरेदी विचारात घ्या.',
        'ta': 'அதிக தேவை மற்றும் குறைந்த விநியோகம். விலை உயர்வு எதிர்பார்க்கலாம். மொத்த வாங்குதலை கருத்தில் கொள்ளுங்கள்.',
        'gu': 'ઊંચી માંગ અને મર્યાદિત પુરવઠો. કિંમત વધારાની અપેક્ષા. બલ્ક ખરીદી વિચારો.',
        'kn': 'ಹೆಚ್ಚಿನ ಬೇಡಿಕೆ ಮತ್ತು ಸೀಮಿತ ಪೂರೈಕೆ. ಬೆಲೆ ಹೆಚ್ಚಳವನ್ನು ನಿರೀಕ್ಷಿಸಿ. ಬಲ್ಕ್ ಖರೀದಿಯನ್ನು ಪರಿಗಣಿಸಿ.',
        'ml': 'ഉയർന്ന ഡിമാൻഡും പരിമിതമായ വിതരണവും. വില വർധനവ് പ്രതീക്ഷിക്കുക. ബൾക്ക് വാങ്ങൽ പരിഗണിക്കുക.',
        'pa': 'ਉੱਚੀ ਮੰਗ ਅਤੇ ਸੀਮਤ ਸਪਲਾਈ। ਕੀਮਤ ਵਧਣ ਦੀ ਉਮੀਦ। ਬਲਕ ਖਰੀਦਦਾਰੀ ਬਾਰੇ ਸੋਚੋ।',
        'or': 'ଉଚ୍ଚ ଚାହିଦା ଏବଂ ସୀମିତ ଯୋଗାଣ। ମୂଲ୍ୟ ବୃଦ୍ଧି ଆଶା କରନ୍ତୁ। ବଲ୍କ କିଣିବା ବିଷୟରେ ଭାବନ୍ତୁ।',
        'as': 'উচ্চ চাহিদা আৰু সীমিত যোগান। দাম বৃদ্ধিৰ প্ৰত্যাশা। বাল্ক ক্ৰয় বিবেচনা কৰক।',
        'en': text
      }
    };

    return translations[text]?.[language] || text;
  }

  private predictFuturePrices(
    category: string,
    currentPrice: number,
    trend: string,
    seasonalFactor: number
  ) {
    // AI-based price prediction algorithm
    let trendMultiplier = 1.0;

    switch (trend) {
      case 'rising':
        trendMultiplier = 1.05; // 5% increase trend
        break;
      case 'falling':
        trendMultiplier = 0.95; // 5% decrease trend
        break;
      default:
        trendMultiplier = 1.0; // Stable
    }

    // Next week prediction
    const nextWeekPrice = currentPrice * trendMultiplier * (1 + (seasonalFactor - 1) * 0.1);

    // Next month prediction (more seasonal impact)
    const nextMonthPrice = currentPrice * Math.pow(trendMultiplier, 4) * seasonalFactor;

    return {
      nextWeek: Math.round(nextWeekPrice * 100) / 100,
      nextMonth: Math.round(nextMonthPrice * 100) / 100,
      confidence: 0.75
    };
  }

  private calculateAdvancedConfidence(
    currentProducts: number,
    recentNegotiations: number,
    historicalDataPoints: number,
    volatility: string
  ): number {
    let confidence = 0.4; // Base confidence

    // More current products = higher confidence
    confidence += Math.min(0.35, currentProducts * 0.025);

    // Recent negotiations add confidence
    confidence += Math.min(0.2, recentNegotiations * 0.015);

    // Historical data adds confidence
    confidence += Math.min(0.05, historicalDataPoints * 0.002);

    // Volatility affects confidence
    switch (volatility) {
      case 'low':
        confidence += 0.1;
        break;
      case 'high':
        confidence -= 0.1;
        break;
    }

    return Math.min(0.95, Math.max(0.1, confidence));
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

      // Group by day and calculate trends
      const dailyData: { [key: string]: { prices: number[]; count: number } } = {};

      products.forEach(product => {
        const dayKey = product.updatedAt.toISOString().split('T')[0];
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = { prices: [], count: 0 };
        }
        dailyData[dayKey].prices.push(product.currentPrice);
        dailyData[dayKey].count++;
      });

      const historyPoints = Object.entries(dailyData)
        .map(([date, data]) => ({
          date: new Date(date),
          averagePrice: data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length,
          volume: data.count,
          trend: 'stable' as 'rising' | 'falling' | 'stable'
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate trends for each point
      for (let i = 1; i < historyPoints.length; i++) {
        const current = historyPoints[i];
        const previous = historyPoints[i - 1];
        const change = ((current.averagePrice - previous.averagePrice) / previous.averagePrice) * 100;

        if (change > 2) current.trend = 'rising';
        else if (change < -2) current.trend = 'falling';
        else current.trend = 'stable';
      }

      return historyPoints;
    } catch (error) {
      console.error('Price history error:', error);
      return [];
    }
  }

  // Market analysis for specific category
  async getMarketAnalysis(
    category: string,
    location?: string,
    language: SupportedLanguage = 'en'
  ): Promise<MarketAnalysis> {
    const priceData = await this.getPriceDiscovery(category, location, language);
    const history = await this.getPriceHistory(category, location, 7);

    const currentPrice = priceData.averagePrice;
    const previousPrice = history.length > 1 ? history[history.length - 2].averagePrice : currentPrice;
    const changePercentage = ((currentPrice - previousPrice) / previousPrice) * 100;

    const currentMonth = new Date().getMonth() + 1;
    const seasonalData = this.seasonalFactors[category]?.[currentMonth] || { factor: 1.0, reason: 'Normal conditions' };

    return {
      category,
      currentPrice,
      previousPrice,
      changePercentage: Math.round(changePercentage * 100) / 100,
      trend: priceData.marketTrend,
      factors: priceData.aiInsights.recommendations.slice(0, 3),
      seasonalImpact: seasonalData.reason,
      demandSupplyBalance: `${priceData.aiInsights.demandLevel} demand, ${priceData.aiInsights.supplyStatus} supply`
    };
  }

  private getDefaultPriceData(category: string, location: string, language: SupportedLanguage): PriceDiscoveryData {
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
    const currentMonth = new Date().getMonth() + 1;
    const seasonalData = this.seasonalFactors[category]?.[currentMonth] || { factor: 1.0, reason: 'Normal conditions' };

    return {
      productCategory: category,
      location,
      averagePrice: priceData.avg,
      priceRange: {
        min: priceData.min,
        max: priceData.max
      },
      marketTrend: 'stable',
      confidence: 0.3,
      lastUpdated: new Date(),
      aiInsights: {
        seasonalFactor: seasonalData.factor,
        demandLevel: 'medium',
        supplyStatus: 'normal',
        priceVolatility: 'low',
        recommendations: [
          this.translateRecommendation('Limited data available. Check back for updated insights.', language)
        ]
      },
      predictedPrices: {
        nextWeek: priceData.avg * seasonalData.factor,
        nextMonth: priceData.avg * seasonalData.factor,
        confidence: 0.3
      }
    };
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache(): void {
    this.cache.clear();
  }

  // Get real-time market alerts
  async getMarketAlerts(
    categories: string[],
    location?: string,
    language: SupportedLanguage = 'en'
  ): Promise<Array<{ category: string; alert: string; severity: 'high' | 'medium' | 'low' }>> {
    const alerts = [];

    for (const category of categories) {
      try {
        const analysis = await this.getMarketAnalysis(category, location, language);

        if (Math.abs(analysis.changePercentage) > 15) {
          alerts.push({
            category,
            alert: this.translateRecommendation(
              `Significant price ${analysis.changePercentage > 0 ? 'increase' : 'decrease'} of ${Math.abs(analysis.changePercentage).toFixed(1)}%`,
              language
            ),
            severity: 'high' as const
          });
        } else if (Math.abs(analysis.changePercentage) > 8) {
          alerts.push({
            category,
            alert: this.translateRecommendation(
              `Moderate price ${analysis.changePercentage > 0 ? 'increase' : 'decrease'} of ${Math.abs(analysis.changePercentage).toFixed(1)}%`,
              language
            ),
            severity: 'medium' as const
          });
        }
      } catch (error) {
        console.error(`Error generating alert for ${category}:`, error);
      }
    }

    return alerts;
  }
}

export const priceDiscoveryService = new PriceDiscoveryService();