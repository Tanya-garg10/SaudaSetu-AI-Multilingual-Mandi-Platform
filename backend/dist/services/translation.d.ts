import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../types/shared';
interface TranslationResult {
    translatedText: string;
    confidence: number;
}
declare class TranslationService {
    private cache;
    private readonly translations;
    translate(text: string, fromLanguage: SupportedLanguage, toLanguage: SupportedLanguage): Promise<TranslationResult>;
    private mockTranslate;
    detectLanguage(text: string): Promise<SupportedLanguage>;
    getSupportedLanguages(): typeof SUPPORTED_LANGUAGES;
    addTranslation(originalText: string, translatedText: string, fromLanguage: SupportedLanguage, toLanguage: SupportedLanguage): void;
    clearCache(): void;
}
export declare const translationService: TranslationService;
export {};
//# sourceMappingURL=translation.d.ts.map