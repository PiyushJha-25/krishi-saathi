import express from 'express';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const client = new BedrockRuntimeClient({
    region: process.env.AWS_BEDROCK_REGION,
    credentials: {
        accessKeyId: process.env.AWS_BEDROCK_API_KEY,
        secretAccessKey: process.env.AWS_BEDROCK_SECRET_KEY
    }
});

router.post('/message', async (req, res) => {
    const { message, conversationHistory = [] } = req.body;

    const systemPrompt = `You are Sahayak, a friendly AI assistant for Indian farmers.
You help with: crop diseases, market prices, weather advice, government schemes (PM Kisan, PMFBY, Kisan Credit Card), farming techniques, pest management, soil health, fertilizer advice.
Keep answers short (3-4 sentences max). Be warm and friendly like a knowledgeable neighbor.

CRITICAL LANGUAGE RULE: You MUST reply in the EXACT same language the user typed in.
- If user types in English → reply ONLY in English
- If user types in Hindi → reply ONLY in Hindi  
- If user types in Telugu → reply ONLY in Telugu
- If user types in Tamil → reply ONLY in Tamil
- Never switch languages unless the user switches first

If asked about current prices, give realistic Indian market price ranges.
Always end with one practical actionable tip.`;

    const messages = [
        ...conversationHistory,
        { role: 'user', content: [{ text: message }] }
    ];

    try {
        const command = new ConverseCommand({
            modelId: 'amazon.nova-lite-v1:0',
            system: [{ text: systemPrompt }],
            messages,
            inferenceConfig: { maxTokens: 500, temperature: 0.7 }
        });
        const response = await client.send(command);
        const reply = response.output.message.content[0].text;
        res.json({ reply, success: true });
    } catch (err) {
        console.error('Sahayak error:', err);
        res.json({ reply: 'Maafi karein, abhi network problem hai. Thodi der baad try karein.', success: false });
    }
});

export default router;
