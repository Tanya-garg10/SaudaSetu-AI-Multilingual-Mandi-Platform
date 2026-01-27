interface CounterOfferSuggestion {
    suggestedPrice: number;
    suggestedQuantity: number;
    reasoning: string;
    confidence: number;
}
declare class NegotiationEngine {
    suggestCounterOffer(negotiationId: string, currentOfferPrice: number, currentOfferQuantity: number): Promise<CounterOfferSuggestion | null>;
    analyzeFairness(negotiationId: string): Promise<{
        fairnessScore: number;
        analysis: string;
        recommendations: string[];
    } | null>;
    getOptimalPrice(productId: string, quantity: number): Promise<{
        optimalPrice: number;
        priceRange: {
            min: number;
            max: number;
        };
        reasoning: string;
    } | null>;
}
export declare const negotiationEngine: NegotiationEngine;
export {};
//# sourceMappingURL=negotiationEngine.d.ts.map