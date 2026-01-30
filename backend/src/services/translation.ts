import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../types/shared';

interface TranslationResult {
  translatedText: string;
  confidence: number;
  marketContext?: string[];
}

interface AdvancedTranslationRequest {
  text: string;
  fromLanguage: SupportedLanguage;
  toLanguage: SupportedLanguage;
  context?: 'negotiation' | 'product_description' | 'pricing' | 'general';
}

class TranslationService {
  private cache: Map<string, TranslationResult> = new Map();

  // Enhanced translation dictionary with market-specific terminology
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
    'quality': {
      'hi': 'गुणवत्ता',
      'bn': 'মান',
      'te': 'నాణ్యత',
      'mr': 'गुणवत्ता',
      'ta': 'தரம்',
      'gu': 'ગુણવત્તા',
      'kn': 'ಗುಣಮಟ್ಟ',
      'ml': 'നിലവാരം',
      'pa': 'ਗੁਣਵੱਤਾ',
      'or': 'ଗୁଣବତ୍ତା',
      'as': 'মান'
    },
    'fresh': {
      'hi': 'ताजा',
      'bn': 'তাজা',
      'te': 'తాజా',
      'mr': 'ताजे',
      'ta': 'புதிய',
      'gu': 'તાજું',
      'kn': 'ತಾಜಾ',
      'ml': 'പുതിയ',
      'pa': 'ਤਾਜ਼ਾ',
      'or': 'ତାଜା',
      'as': 'সতেজ'
    },
    'discount': {
      'hi': 'छूट',
      'bn': 'ছাড়',
      'te': 'తగ్గింపు',
      'mr': 'सूट',
      'ta': 'தள்ளுபடி',
      'gu': 'છૂટ',
      'kn': 'ರಿಯಾಯಿತಿ',
      'ml': 'കിഴിവ്',
      'pa': 'ਛੋਟ',
      'or': 'ଛାଡ',
      'as': 'ছাৰ'
    },
    'negotiation': {
      'hi': 'बातचीत',
      'bn': 'দরকষাকষি',
      'te': 'చర్చలు',
      'mr': 'वाटाघाटी',
      'ta': 'பேச்சுவார்த்தை',
      'gu': 'વાટાઘાટ',
      'kn': 'ಮಾತುಕತೆ',
      'ml': 'ചർച്ച',
      'pa': 'ਗੱਲਬਾਤ',
      'or': 'ବୁଝାମଣା',
      'as': 'আলোচনা'
    },
    'wholesale': {
      'hi': 'थोक',
      'bn': 'পাইকারি',
      'te': 'టోకు',
      'mr': 'घाऊक',
      'ta': 'மொத்த',
      'gu': 'જથ્થાબંધ',
      'kn': 'ಸಗಟು',
      'ml': 'മൊത്തം',
      'pa': 'ਥੋਕ',
      'or': 'ହୋଲସେଲ',
      'as': 'পাইকাৰী'
    },
    'retail': {
      'hi': 'खुदरा',
      'bn': 'খুচরা',
      'te': 'చిల్లర',
      'mr': 'किरकोळ',
      'ta': 'சில்லறை',
      'gu': 'છૂટક',
      'kn': 'ಚಿಲ್ಲರೆ',
      'ml': 'ചില്ലറ',
      'pa': 'ਪਰਚੂਨ',
      'or': 'ଖୁଚୁରା',
      'as': 'খুচুৰা'
    },

    // Vegetables
    'tomato': {
      'hi': 'टमाटर',
      'bn': 'টমেটো',
      'te': 'టమాటో',
      'mr': 'टमाटर',
      'ta': 'தக்காளி',
      'gu': 'ટમેટા',
      'kn': 'ಟೊಮೇಟೊ',
      'ml': 'തക്കാളി',
      'pa': 'ਟਮਾਟਰ',
      'or': 'ଟମାଟୋ',
      'as': 'বিলাহী'
    },
    'onion': {
      'hi': 'प्याज',
      'bn': 'পেঁয়াজ',
      'te': 'ఉల్లిపాయ',
      'mr': 'कांदा',
      'ta': 'வெங்காயம்',
      'gu': 'ડુંગળી',
      'kn': 'ಈರುಳ್ಳಿ',
      'ml': 'ഉള്ളി',
      'pa': 'ਪਿਆਜ਼',
      'or': 'ପିଆଜ',
      'as': 'পিয়াঁজ'
    },
    'potato': {
      'hi': 'आलू',
      'bn': 'আলু',
      'te': 'బంగాళాదుంప',
      'mr': 'बटाटा',
      'ta': 'உருளைக்கிழங்கு',
      'gu': 'બટાકા',
      'kn': 'ಆಲೂಗಡ್ಡೆ',
      'ml': 'ഉരുളക്കിഴങ്ങ്',
      'pa': 'ਆਲੂ',
      'or': 'ଆଳୁ',
      'as': 'আলু'
    },

    // Fruits
    'mango': {
      'hi': 'आम',
      'bn': 'আম',
      'te': 'మామిడిపండు',
      'mr': 'आंबा',
      'ta': 'மாம்பழம்',
      'gu': 'કેરી',
      'kn': 'ಮಾವಿನಹಣ್ಣು',
      'ml': 'മാങ്ങ',
      'pa': 'ਅੰਬ',
      'or': 'ଆମ୍ବ',
      'as': 'আম'
    },
    'banana': {
      'hi': 'केला',
      'bn': 'কলা',
      'te': 'అరటిపండు',
      'mr': 'केळी',
      'ta': 'வாழைப்பழம்',
      'gu': 'કેળા',
      'kn': 'ಬಾಳೆಹಣ್ಣು',
      'ml': 'വാഴപ്പഴം',
      'pa': 'ਕੇਲਾ',
      'or': 'କଦଳୀ',
      'as': 'কল'
    },
    'orange': {
      'hi': 'संतरा',
      'bn': 'কমলা',
      'te': 'నారింజ',
      'mr': 'संत्रे',
      'ta': 'ஆரஞ்சு',
      'gu': 'સંતરા',
      'kn': 'ಕಿತ್ತಳೆ',
      'ml': 'ഓറഞ്ച്',
      'pa': 'ਸੰਤਰਾ',
      'or': 'କମଳା',
      'as': 'কমলা'
    },

    // Grains & Spices
    'rice': {
      'hi': 'चावल',
      'bn': 'চাল',
      'te': 'బియ్యం',
      'mr': 'तांदूळ',
      'ta': 'அரிசி',
      'gu': 'ચોખા',
      'kn': 'ಅಕ್ಕಿ',
      'ml': 'അരി',
      'pa': 'ਚਾਵਲ',
      'or': 'ଚାଉଳ',
      'as': 'চাউল'
    },
    'wheat': {
      'hi': 'गेहूं',
      'bn': 'গম',
      'te': 'గోధుమ',
      'mr': 'गहू',
      'ta': 'கோதுமை',
      'gu': 'ઘઉં',
      'kn': 'ಗೋಧಿ',
      'ml': 'ഗോതമ്പ്',
      'pa': 'ਕਣਕ',
      'or': 'ଗହମ',
      'as': 'ঘেঁহু'
    },
    'turmeric': {
      'hi': 'हल्दी',
      'bn': 'হলুদ',
      'te': 'పసుపు',
      'mr': 'हळद',
      'ta': 'மஞ்சள்',
      'gu': 'હળદર',
      'kn': 'ಅರಿಶಿನ',
      'ml': 'മഞ്ഞൾ',
      'pa': 'ਹਲਦੀ',
      'or': 'ହଳଦୀ',
      'as': 'হালধি'
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
    'what is the price': {
      'hi': 'कीमत क्या है',
      'bn': 'দাম কত',
      'te': 'ధర ఎంత',
      'mr': 'किंमत काय आहे',
      'ta': 'விலை என்ன',
      'gu': 'કિંમત કેટલી છે',
      'kn': 'ಬೆಲೆ ಎಷ್ಟು',
      'ml': 'വില എത്രയാണ്',
      'pa': 'ਕੀਮਤ ਕੀ ਹੈ',
      'or': 'ଦାମ କେତେ',
      'as': 'দাম কিমান'
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
    'can you reduce the price': {
      'hi': 'क्या आप कीमत कम कर सकते हैं',
      'bn': 'আপনি কি দাম কমাতে পারেন',
      'te': 'మీరు ధర తగ్గించగలరా',
      'mr': 'तुम्ही किंमत कमी करू शकता का',
      'ta': 'நீங்கள் விலையை குறைக்க முடியுமா',
      'gu': 'શું તમે કિંમત ઘટાડી શકો છો',
      'kn': 'ನೀವು ಬೆಲೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಬಹುದೇ',
      'ml': 'നിങ്ങൾക്ക് വില കുറയ്ക്കാൻ കഴിയുമോ',
      'pa': 'ਕੀ ਤੁਸੀਂ ਕੀਮਤ ਘਟਾ ਸਕਦੇ ਹੋ',
      'or': 'ଆପଣ ଦାମ କମାଇ ପାରିବେ କି',
      'as': 'আপুনি দাম কমাব পাৰিবনে'
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
    },
    'i will buy': {
      'hi': 'मैं खरीदूंगा',
      'bn': 'আমি কিনব',
      'te': 'నేను కొనుగోలు చేస్తాను',
      'mr': 'मी विकत घेईन',
      'ta': 'நான் வாங்குவேன்',
      'gu': 'હું ખરીદીશ',
      'kn': 'ನಾನು ಖರೀದಿಸುತ್ತೇನೆ',
      'ml': 'ഞാൻ വാങ്ങും',
      'pa': 'ਮੈਂ ਖਰੀਦਾਂਗਾ',
      'or': 'ମୁଁ କିଣିବି',
      'as': 'মই কিনিম'
    },
    'deal accepted': {
      'hi': 'सौदा मंजूर',
      'bn': 'চুক্তি গৃহীত',
      'te': 'ఒప్పందం అంగీకరించబడింది',
      'mr': 'करार मान्य',
      'ta': 'ஒப்பந்தம் ஏற்கப்பட்டது',
      'gu': 'સોદો સ્વીકાર્યો',
      'kn': 'ಒಪ್ಪಂದ ಒಪ್ಪಿಕೊಳ್ಳಲಾಗಿದೆ',
      'ml': 'കരാർ അംഗീകരിച്ചു',
      'pa': 'ਸੌਦਾ ਮਨਜ਼ੂਰ',
      'or': 'ଚୁକ୍ତି ଗ୍ରହଣ କରାଗଲା',
      'as': 'চুক্তি গ্রহণ করা হল'
    }
  };

  // Context-aware phrase templates
  private readonly contextualPhrases = {
    negotiation: {
      'counter_offer': {
        'hi': 'मैं {price} रुपये प्रति {unit} दे सकता हूं',
        'bn': 'আমি {price} টাকা প্রতি {unit} দিতে পারি',
        'te': 'నేను {unit}కు {price} రూపాయలు ఇవ్వగలను',
        'mr': 'मी {unit} साठी {price} रुपये देऊ शकतो',
        'ta': 'நான் {unit}க்கு {price} ரூபாய் கொடுக்க முடியும்',
        'gu': 'હું {unit} માટે {price} રૂપિયા આપી શકું છું',
        'kn': 'ನಾನು {unit}ಗೆ {price} ರೂಪಾಯಿಗಳನ್ನು ಕೊಡಬಹುದು',
        'ml': 'എനിക്ക് {unit}ന് {price} രൂപ കൊടുക്കാം',
        'pa': 'ਮੈਂ {unit} ਲਈ {price} ਰੁਪਏ ਦੇ ਸਕਦਾ ਹਾਂ',
        'or': 'ମୁଁ {unit} ପାଇଁ {price} ଟଙ୍କା ଦେଇ ପାରିବି',
        'as': 'মই {unit}ৰ বাবে {price} টকা দিব পাৰোঁ'
      }
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
      const translatedText = await this.advancedTranslate(text, fromLanguage, toLanguage);
      const marketContext = this.getMarketContext(text);

      const result: TranslationResult = {
        translatedText,
        confidence: 0.92,
        marketContext
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return {
        translatedText: text,
        confidence: 0.1
      };
    }
  }

  private async advancedTranslate(
    text: string,
    fromLanguage: SupportedLanguage,
    toLanguage: SupportedLanguage
  ): Promise<string> {
    if (fromLanguage === toLanguage) return text;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    const lowerText = text.toLowerCase().trim();

    // Check for exact phrase matches first
    if (this.translations[lowerText] && this.translations[lowerText][toLanguage]) {
      return this.translations[lowerText][toLanguage]!;
    }

    // Check for partial matches and replace them
    let translatedText = text;
    for (const [key, translations] of Object.entries(this.translations)) {
      if (lowerText.includes(key) && translations[toLanguage]) {
        const regex = new RegExp(key, 'gi');
        translatedText = translatedText.replace(regex, translations[toLanguage]!);
      }
    }

    // Handle numbers and currency
    if (/^\d+(\.\d+)?$/.test(text) || text.includes('₹') || text.includes('Rs')) {
      return text;
    }

    // Handle price patterns like "₹50 per kg"
    const pricePattern = /₹(\d+(?:\.\d+)?)\s*(?:per|प्रति|প্রতি)\s*(\w+)/gi;
    translatedText = translatedText.replace(pricePattern, (match, price, unit) => {
      const translatedUnit = this.translations[unit.toLowerCase()]?.[toLanguage] || unit;
      const perWord = toLanguage === 'hi' ? 'प्रति' :
        toLanguage === 'bn' ? 'প্রতি' :
          toLanguage === 'te' ? 'ప్రతి' :
            toLanguage === 'mr' ? 'प्रति' :
              toLanguage === 'ta' ? 'ஒன்றுக்கு' :
                toLanguage === 'gu' ? 'પ્રતિ' :
                  toLanguage === 'kn' ? 'ಪ್ರತಿ' :
                    toLanguage === 'ml' ? 'ഓരോ' :
                      toLanguage === 'pa' ? 'ਪ੍ਰਤੀ' :
                        toLanguage === 'or' ? 'ପ୍ରତି' :
                          toLanguage === 'as' ? 'প্ৰতি' : 'per';
      return `₹${price} ${perWord} ${translatedUnit}`;
    });

    // If no translation found and it's not the same as original, add language indicator
    if (translatedText === text && fromLanguage !== toLanguage) {
      return `[${toLanguage.toUpperCase()}] ${text}`;
    }

    return translatedText;
  }

  private getMarketContext(text: string): string[] {
    const contexts: string[] = [];
    const lowerText = text.toLowerCase();

    // Check for different market contexts
    if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('कीमत') || lowerText.includes('দাম')) {
      contexts.push('pricing');
    }
    if (lowerText.includes('quality') || lowerText.includes('fresh') || lowerText.includes('गुणवत्ता') || lowerText.includes('মান')) {
      contexts.push('quality_assessment');
    }
    if (lowerText.includes('negotiate') || lowerText.includes('discount') || lowerText.includes('बातचीत') || lowerText.includes('দরকষাকষি')) {
      contexts.push('negotiation');
    }
    if (lowerText.includes('wholesale') || lowerText.includes('bulk') || lowerText.includes('थोक') || lowerText.includes('পাইকারি')) {
      contexts.push('wholesale');
    }
    if (lowerText.includes('retail') || lowerText.includes('खुदरा') || lowerText.includes('খুচরা')) {
      contexts.push('retail');
    }

    return contexts;
  }

  async detectLanguage(text: string): Promise<SupportedLanguage> {
    // Enhanced language detection with better accuracy
    const lowerText = text.toLowerCase();

    // Check for English first
    if (/^[a-zA-Z0-9\s.,!?₹$]+$/.test(text)) {
      return 'en';
    }

    // Language-specific character patterns with better coverage
    const patterns = {
      'hi': /[\u0900-\u097F]/,
      'bn': /[\u0980-\u09FF]/,
      'te': /[\u0C00-\u0C7F]/,
      'mr': /[\u0900-\u097F]/,
      'ta': /[\u0B80-\u0BFF]/,
      'gu': /[\u0A80-\u0AFF]/,
      'kn': /[\u0C80-\u0CFF]/,
      'ml': /[\u0D00-\u0D7F]/,
      'pa': /[\u0A00-\u0A7F]/,
      'or': /[\u0B00-\u0B7F]/,
      'as': /[\u0980-\u09FF]/
    };

    // Count matches for each language
    const scores: Record<string, number> = {};
    for (const [lang, pattern] of Object.entries(patterns)) {
      const matches = text.match(new RegExp(pattern.source, 'g'));
      scores[lang] = matches ? matches.length : 0;
    }

    // Return language with highest score
    const bestMatch = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
    return bestMatch[1] > 0 ? bestMatch[0] as SupportedLanguage : 'en';
  }

  getSupportedLanguages(): typeof SUPPORTED_LANGUAGES {
    return SUPPORTED_LANGUAGES;
  }

  // Real-time message translation for chat
  async translateMessage(
    message: string,
    fromLanguage: SupportedLanguage,
    toLanguage: SupportedLanguage,
    context?: 'negotiation' | 'product_description' | 'pricing'
  ): Promise<string> {
    if (fromLanguage === toLanguage) return message;

    const result = await this.translate(message, fromLanguage, toLanguage);
    return result.translatedText;
  }

  // Batch translation for multiple messages
  async translateBatch(
    messages: Array<{ text: string; fromLanguage: SupportedLanguage; toLanguage: SupportedLanguage }>,
    context?: string
  ): Promise<string[]> {
    const translations = await Promise.all(
      messages.map(msg => this.translateMessage(msg.text, msg.fromLanguage, msg.toLanguage))
    );
    return translations;
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

  // Get translation statistics
  getStats() {
    return {
      cacheSize: this.cache.size,
      supportedLanguages: Object.keys(this.getSupportedLanguages()).length,
      marketTerms: Object.keys(this.translations).length
    };
  }
}

export const translationService = new TranslationService();