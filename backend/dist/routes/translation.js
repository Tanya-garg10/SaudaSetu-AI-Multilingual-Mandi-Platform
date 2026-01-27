"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const translation_1 = require("../services/translation");
const shared_1 = require("../types/shared");
const router = express_1.default.Router();
const translateSchema = joi_1.default.object({
    text: joi_1.default.string().required(),
    fromLanguage: joi_1.default.string().valid(...Object.keys(shared_1.SUPPORTED_LANGUAGES)).required(),
    toLanguage: joi_1.default.string().valid(...Object.keys(shared_1.SUPPORTED_LANGUAGES)).required()
});
// Translate text
router.post('/translate', async (req, res) => {
    try {
        const { error, value } = translateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        const { text, fromLanguage, toLanguage } = value;
        if (fromLanguage === toLanguage) {
            return res.json({
                success: true,
                data: {
                    translatedText: text,
                    confidence: 1.0
                }
            });
        }
        const result = await translation_1.translationService.translate(text, fromLanguage, toLanguage);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Translation service error'
        });
    }
});
// Get supported languages
router.get('/languages', (req, res) => {
    res.json({
        success: true,
        data: shared_1.SUPPORTED_LANGUAGES
    });
});
// Detect language
router.post('/detect', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }
        const detectedLanguage = await translation_1.translationService.detectLanguage(text);
        res.json({
            success: true,
            data: {
                language: detectedLanguage,
                confidence: 0.9 // Mock confidence score
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Language detection error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=translation.js.map