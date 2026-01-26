import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../../shared/types';

interface TranslationResult {
  translatedText: string;
  confidence: number;
}

class TranslationService {
  private cache: Map<string, TranslationResult> = new Map();

  // Mock translation dictionary for common market terms
  private readonly translations: { [key: string]: { [key in SupportedLanguage]?: string } } = {
    // Greetings
    'hello': {
      'hi': 'नमस्ते',
      'bn': 'হ্যালো',
      'te': 'హలో',
      'mr': 'नमस्कार',
      'ta': 'வணக்கம்',
      'gu': 'નમસ્તે',
      'kn': 'ನಮಸ್ಕಾರ',
      'ml': 'നമസ്കാരം',
      'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
      'or': 'ନମସ୍କାର',
      'as': 'নমস্কাৰ'
    },
    'good morning': {
      'hi': 'सुप्रभात',
      'bn': 'সুপ্রভাত',
      'te': 'శుభోదయం',
      'mr': 'सुप्रभात',
      'ta': 'காலை வணக்கம்',
      'gu': 'સુપ્રભાત',
      'kn': 'ಶುಭೋದಯ',
      'ml': 'സുപ്രഭാതം',
      'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
      'or': 'ସୁପ୍ରଭାତ',
      'as': 'শুভ ৰাতিপুৱা'
    },
    // Market terms
    'price': {
      'hi': 'कीमत',
      'bn': 'দাম',
      'te': 'ధర',
      'mr': 'किंमत',
      'ta': 'விலை',
      'gu': 'કિંમત',
      'kn': 'ಬೆಲೆ',
      'ml': 'വില',
      'pa': 'ਕੀਮਤ',
      'or': 'ଦାମ',
      'as': 'দাম'
    },
    'quantity': {
      'hi': 'मात्रा',
      'bn': 'পরিমাণ',
      'te': 'పరిమాణం',
      'mr': 'प्रमाण',
      'ta': 'அளவு',
      'gu': 'માત્રા',
      'kn': 'ಪ್ರಮಾಣ',
      'ml': 'അളവ്',
      'pa': 'ਮਾਤਰਾ',
      'or': 'ପରିମାଣ',
      'as': 'পৰিমাণ'
    },
    'vegetables': {
      'hi': 'सब्जियां',
      'bn': 'সবজি',
      'te': 'కూరగాయలు',
      'mr': 'भाज्या',
      'ta': 'காய்கறிகள்',
      'gu': 'શાકભાજી',
      'kn': 'ತರಕಾರಿಗಳು',
      'ml': 'പച്ചക്കറികൾ',
      'pa': 'ਸਬਜ਼ੀਆਂ',
      'or': 'ପନିପରିବା',
      'as': 'পাচলি'
    },
    'fruits': {
      'hi': 'फल',
      'bn': 'ফল',
      'te': 'పండ్లు',
      'mr': 'फळे',
      'ta': 'பழங்கள்',
      'gu': 'ફળો',
      'kn': 'ಹಣ್ಣುಗಳು',
      'ml': 'പഴങ്ങൾ',
      'pa': 'ਫਲ',
      'or': 'ଫଳ',
      'as': 'ফল'
    },
    // Common phrases
    'how much': {
      'hi': 'कितना',
      'bn': 'কত',
      'te': 'ఎంత',
      'mr': 'किती',
      'ta': 'எவ்வளவு',
      'gu': 'કેટલું',
      'kn': 'ಎಷ್ಟು',
      'ml': 'എത്ര',
      'pa': 'ਕਿੰਨਾ',
      'or': 'କେତେ',
      'as': 'কিমান'
    },
    'too expensive': {
      'hi': 'बहुत महंगा',
      'bn': 'খুব দামি',
      'te': 'చాలా ఖరీదు',
      'mr': 'खूप महाग',
      'ta': 'மிகவும் விலை அதிகம்',
      'gu': 'ખૂબ મોંઘું',
      'kn': 'ತುಂಬಾ ದುಬಾರಿ',
      'ml': 'വളരെ വിലയേറിയത്',
      'pa': 'ਬਹੁਤ ਮਹਿੰਗਾ',
      'or': 'ବହୁତ ମହଙ୍ଗା',
      'as': 'বহুত দামী'
    },
    'good quality': {
      'hi': 'अच्छी गुणवत्ता',
      'bn': 'ভাল মানের',
      'te': 'మంచి నాణ్యత',
      'mr': 'चांगली गुणवत्ता',
      'ta': 'நல்ல தரம்',
      'gu': 'સારી ગુણવત્તા',
      'kn': 'ಉತ್ತಮ ಗುಣಮಟ್ಟ',
      'ml': 'നല്ല നിലവാരം',
      'pa': 'ਚੰਗੀ ਗੁਣਵੱਤਾ',
      'or': 'ଭଲ ଗୁଣବତ୍ତା',
      'as': 'ভাল মানৰ'
    }
  };

  async translate(
    text: string,
    fromLanguage: SupportedLanguage,
    toLanguage: SupportedLanguage
  ): Promise<TranslationResult> {
    const cacheKey = `${text}-${fromLanguage}-${toLanguage}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // For demo purposes, use mock translation
      const translatedText = await this.mockTranslate(text, fromLanguage, toLanguage);
      const result: TranslationResult = {
        translatedText,
        confidence: 0.85
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return {
        translatedText: text, // Fallback to original text
        confidence: 0.1
      };
    }
  }

  private async mockTranslate(
    text: string,
    fromLanguage: SupportedLanguage,
    toLanguage: SupportedLanguage
  ): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const lowerText = text.toLowerCase().trim();
    
    // Check for exact matches in our dictionary
    if (this.translations[lowerText] && this.translations[lowerText][toLanguage]) {
      return this.translations[lowerText][toLanguage]!;
    }

    // Check for partial matches
    for (const [key, translations] of Object.entries(this.translations)) {
      if (lowerText.includes(key) && translations[toLanguage]) {
        return text.replace(new RegExp(key, 'gi'), translations[toLanguage]!);
      }
    }

    // For numbers and prices, keep them as is
    if (/^\d+(\.\d+)?$/.test(text) || text.includes('₹') || text.includes('Rs')) {
      return text;
    }

    // If no translation found, return with language indicator
    return `[${toLanguage.toUpperCase()}] ${text}`;
  }

  async detectLanguage(text: string): Promise<SupportedLanguage> {
    // Simple language detection based on character patterns
    const lowerText = text.toLowerCase();

    // Check for English
    if (/^[a-zA-Z0-9\s.,!?]+$/.test(text)) {
      return 'en';
    }

    // Check for Hindi (Devanagari script)
    if (/[\u0900-\u097F]/.test(text)) {
      return 'hi';
    }

    // Check for Bengali
    if (/[\u0980-\u09FF]/.test(text)) {
      return 'bn';
    }

    // Check for Telugu
    if (/[\u0C00-\u0C7F]/.test(text)) {
      return 'te';
    }

    // Check for Tamil
    if (/[\u0B80-\u0BFF]/.test(text)) {
      return 'ta';
    }

    // Check for Gujarati
    if (/[\u0A80-\u0AFF]/.test(text)) {
      return 'gu';
    }

    // Check for Kannada
    if (/[\u0C80-\u0CFF]/.test(text)) {
      return 'kn';
    }

    // Check for Malayalam
    if (/[\u0D00-\u0D7F]/.test(text)) {
      return 'ml';
    }

    // Check for Punjabi
    if (/[\u0A00-\u0A7F]/.test(text)) {
      return 'pa';
    }

    // Default to Hindi if uncertain
    return 'hi';
  }

  getSupportedLanguages(): typeof SUPPORTED_LANGUAGES {
    return SUPPORTED_LANGUAGES;
  }

  // Add new translation to cache/dictionary
  addTranslation(
    originalText: string,
    translatedText: string,
    fromLanguage: SupportedLanguage,
    toLanguage: SupportedLanguage
  ): void {
    const cacheKey = `${originalText}-${fromLanguage}-${toLanguage}`;
    this.cache.set(cacheKey, {
      translatedText,
      confidence: 1.0
    });
  }

  // Clear translation cache
  clearCache(): void {
    this.cache.clear();
  }
}

export const translationService = new TranslationService();