import express from 'express';
import { getMandiAdvice, getHindiVoiceAdvice, getOfflineMandiAdvice } from './bedrockService.js';

const router = express.Router();

// POST /api/mandi/advice
// Body: { cropName, state, quantity, unit, language }
router.post('/advice', async (req, res) => {
    const { cropName, state, quantity, unit, language } = req.body;

    if (!cropName || !state || !quantity || !unit) {
        return res.status(400).json({ error: 'cropName, state, quantity, and unit are required.' });
    }

    try {
        const advice = await getMandiAdvice(cropName, state, quantity, unit, language);
        res.json({ advice });
    } catch (error) {
        console.error('Bedrock error, using Offline Fallback:', error.message);
        const fallback = getOfflineMandiAdvice(cropName, state, quantity, unit);
        res.json(fallback);
    }
});

// POST /api/mandi/voice-advice
// Body: { cropName, state, bags, quintals }
router.post('/voice-advice', async (req, res) => {
    const { cropName, state, bags, quintals } = req.body;

    if (!cropName || !state || !quintals) {
        return res.status(400).json({ error: 'cropName, state, and quintals are required.' });
    }

    try {
        const hindiAdvice = await getHindiVoiceAdvice(cropName, state, bags, quintals);
        res.json({ hindiAdvice });
    } catch (error) {
        console.error('Bedrock Hindi voice error, using Offline Fallback:', error.message);
        // Fallback for voice also uses the offline text, which the frontend will speak
        const fallback = getOfflineMandiAdvice(cropName, state, bags, 'bags');
        res.json({ hindiAdvice: fallback.advice, isOffline: true });
    }
});

export default router;

