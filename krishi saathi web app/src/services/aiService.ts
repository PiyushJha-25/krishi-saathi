/**
 * Central AI Service Handler for Krishi-Saathi.
 * Demonstrates intelligent branching based on the global AI Mode state.
 */

export const processAiQuery = async (
    query: string,
    isLive: boolean,
    featureId: 'scan' | 'advisory' | 'diary'
): Promise<{ success: boolean; data: any; source: 'API' | 'LOCAL_MOCK' }> => {

    // Simulate network latency
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    if (isLive) {
        // [SIMULATION]: Real API Logic
        console.log(`[aiService] Live mode active. Processing ${featureId} query via external API...`);
        await delay(1500); // simulate 1.5s network roundtrip

        return {
            success: true,
            source: 'API',
            data: {
                message: `[LIVE API RESPONSE for ${featureId}]: Validated "${query}"`,
                timestamp: new Date().toISOString()
            }
        };
    } else {
        // [SIMULATION]: Offline Mock Logic
        console.log(`[aiService] Offline mode active. Intercepting ${featureId} query with cached response.`);
        await delay(300); // simulate fast local cache hit

        return {
            success: true,
            source: 'LOCAL_MOCK',
            data: {
                message: `[OFFLINE MOCK for ${featureId}]: Simulated response for "${query}" based on offline dictionary.`,
                timestamp: new Date().toISOString()
            }
        };
    }
};
