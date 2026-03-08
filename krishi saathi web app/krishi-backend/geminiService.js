import Groq from 'groq-sdk';

export const generateFarmingAdvice = async (entries) => {
    if (!entries || entries.length === 0) {
        return "Add your farm activities to get personalized AI advice.";
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const formattedEntries = entries.map(e =>
        `Date: ${e.date}, Log: ${e.entry_text}`
    ).join('\n');
    const prompt = `You are Krishi Saathi, an AI assistant for small Indian farmers. Based on this farmer's recent free-form journal entries:\n${formattedEntries}\nGive practical weekly advice in simple English. Focus on: cost optimization, crop health, profit improvement. Keep it short - maximum 5 sentences.`;
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Groq API error:", error);
        return "Unable to connect to AI. Showing offline guidance.";
    }
};
