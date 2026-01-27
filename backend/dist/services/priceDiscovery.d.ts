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
declare class PriceDiscoveryService {
    private cache;
    private readonly CACHE_DURATION;
    getPriceDiscovery(category: string, location?: string): Promise<PriceDiscoveryData>;
    private calculatePriceDiscovery;
    private calculateTrend;
    private calculateConfidence;
    private getWeekKey;
    private getDefaultPriceData;
    getPriceHistory(category: string, location?: string, days?: number): Promise<PriceHistoryPoint[]>;
    clearCache(): void;
}
export declare const priceDiscoveryService: PriceDiscoveryService;
export {};
//# sourceMappingURL=priceDiscovery.d.ts.map