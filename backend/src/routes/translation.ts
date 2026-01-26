import express from 'express';
import Joi from 'joi';
import { translationService } from '../services/translation';
import { SUPPORTED_LANGUAGES } from '../../../shared/types';

const router = express.Router();

const translateSchema = Joi.object({
  text: Joi.string().required(),
  fromLanguage: Joi.string().valid(...Object.keys(SUPPORTED_LANGUAGES)).required(),
  toLanguage: Joi.string().valid(...Object.keys(SUPPORTED_LANGUAGES)).required()
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

    const result = await translationService.translate(text, fromLanguage, toLanguage);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
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
    data: SUPPORTED_LANGUAGES
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

    const detectedLanguage = await translationService.detectLanguage(text);

    res.json({
      success: true,
      data: {
        language: detectedLanguage,
        confidence: 0.9 // Mock confidence score
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Language detection error'
    });
  }
});

export default router;