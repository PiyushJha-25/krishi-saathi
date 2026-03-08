/**
 * Plant Disease Detection Service using Plant.id API
 *
 * Attempt order:
 *  1. plant.id v3  — https://plant.id/api/v3/health_assessment
 *  2. crop.kindwise.com — https://crop.kindwise.com/api/v1/identification
 *  3. Mock fallback (demo mode)
 *
 * After a disease name is obtained, Amazon Bedrock enriches it with
 * a common name and a farmer-friendly 2-sentence description.
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const getBedrockClient = () =>
    new BedrockRuntimeClient({
        region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_BEDROCK_API_KEY || '',
            secretAccessKey: process.env.AWS_BEDROCK_SECRET_KEY || '',
        },
    });

/**
 * Use Bedrock to translate a scientific / raw disease name into
 * a common name + 2-sentence farmer-friendly description.
 * Returns { commonName, description } or falls back to sensible defaults.
 */
const enrichWithBedrock = async (rawDiseaseName) => {
    const prompt = `A crop disease identified as "${rawDiseaseName}" has been detected on an Indian farm.
Respond ONLY in this exact format and nothing else:

COMMON_NAME: [easy-to-understand common name in English, e.g. "Wheat Leaf Rust"]
DESCRIPTION: [exactly 2 sentences in very simple English a farmer can understand, mentioning symptoms and what happens if left untreated]`;

    try {
        const client = getBedrockClient();
        const command = new InvokeModelCommand({
            modelId: 'amazon.nova-lite-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                messages: [{ role: 'user', content: [{ text: prompt }] }],
                inferenceConfig: { maxTokens: 120, temperature: 0.4 },
            }),
        });

        const response = await client.send(command);
        const body = JSON.parse(new TextDecoder().decode(response.body));
        const text = body.output.message.content[0].text || '';

        const commonNameMatch = text.match(/COMMON_NAME:\s*(.+)/i);
        const descriptionMatch = text.match(/DESCRIPTION:\s*([\s\S]+)/i);

        const commonName = commonNameMatch?.[1]?.trim() || rawDiseaseName;
        const description = descriptionMatch?.[1]?.trim() || `${rawDiseaseName} detected in the crop sample. Seek treatment immediately to prevent yield loss.`;

        return { commonName, description };
    } catch (err) {
        console.warn('[Bedrock enrich] Failed, using defaults:', err.message);
        return {
            commonName: rawDiseaseName,
            description: `${rawDiseaseName} detected in the crop sample. Early treatment is recommended to prevent significant yield loss.`,
        };
    }
};

// ── Helper: parse the v3 health_assessment response ──────────────────────────
const parseV3Response = (data) => {
    // v3 shape: data.result.disease.suggestions[]
    const suggestions = data?.result?.disease?.suggestions || [];
    if (suggestions.length === 0) throw new Error('No disease suggestions in v3 response');

    const top = suggestions[0];
    const diseaseName = top.name || 'Unknown Disease';
    const probability = Math.round((top.probability || 0) * 100);
    const description =
        top.details?.description ||
        (top.details?.common_names?.length ? top.details.common_names.join(', ') : null) ||
        `${diseaseName} detected in the crop sample.`;

    return { disease: diseaseName, confidence: probability, description };
};

// ── Helper: parse the crop.kindwise v1 response ───────────────────────────────
const parseKindwiseResponse = (data) => {
    const suggestions = data?.result?.disease?.suggestions || data?.suggestions || [];
    if (suggestions.length === 0) throw new Error('No disease suggestions in kindwise response');

    const top = suggestions[0];
    const diseaseName = top.name || 'Unknown Disease';
    const probability = Math.round((top.probability || 0) * 100);
    const description =
        top.details?.description ||
        (top.details?.common_names?.length ? top.details.common_names.join(', ') : null) ||
        `${diseaseName} detected in the crop sample.`;

    return { disease: diseaseName, confidence: probability, description };
};

// ── Mock diseases for demo / full offline fallback ────────────────────────────
const MOCK_DISEASES = [
    {
        disease: 'Puccinia triticina',
        commonName: 'Wheat Leaf Rust',
        confidence: 87,
        description:
            'Your crop has orange-brown powdery spots on the leaves, which is a sign of Leaf Rust. If not treated quickly, it spreads fast and can destroy up to 70% of your harvest.',
    },
    {
        disease: 'Blumeria graminis',
        commonName: 'Powdery Mildew',
        confidence: 79,
        description:
            'White powdery patches on leaves and stems mean your crop has Powdery Mildew. Left untreated, it weakens the plant and causes the grain to shrink and yield to drop.',
    },
    {
        disease: 'Xanthomonas oryzae',
        commonName: 'Bacterial Leaf Blight',
        confidence: 83,
        description:
            'Water-soaked yellow edges on leaves are a sign of Bacterial Leaf Blight. It spreads through rain and irrigation water, and can cause complete crop failure if ignored.',
    },
    {
        disease: 'Alternaria solani',
        commonName: 'Early Blight',
        confidence: 91,
        description:
            'Dark brown spots with rings like a target board on older leaves means Early Blight. It causes heavy leaf fall and weakens the whole plant, cutting your yield significantly.',
    },
];

// ── Main export ───────────────────────────────────────────────────────────────
export const identifyDisease = async (base64Image) => {
    const key = process.env.PLANT_ID_API_KEY;

    // ── Attempt 1: Plant.id v3 health_assessment ─────────────────────────────
    try {
        console.log('[PlantID] Trying plant.id v3 health_assessment...');
        const res = await fetch('https://plant.id/api/v3/health_assessment', {
            method: 'POST',
            headers: {
                'Api-Key': key,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                images: [base64Image],
                health: 'all',
            }),
        });

        if (!res.ok) {
            const body = await res.text();
            throw new Error(`plant.id v3 responded ${res.status}: ${body}`);
        }

        const data = await res.json();
        const result = parseV3Response(data);
        console.log('[PlantID] v3 success:', result.disease);
        const enriched = await enrichWithBedrock(result.disease);
        return { ...result, commonName: enriched.commonName, description: enriched.description };
    } catch (err1) {
        console.warn('[PlantID] v3 failed:', err1.message);
    }

    // ── Attempt 2: crop.kindwise.com v1 ──────────────────────────────────────
    try {
        console.log('[PlantID] Trying crop.kindwise.com v1...');
        const res = await fetch('https://crop.kindwise.com/api/v1/identification', {
            method: 'POST',
            headers: {
                'Api-Key': key,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                images: [base64Image],
            }),
        });

        if (!res.ok) {
            const body = await res.text();
            throw new Error(`crop.kindwise responded ${res.status}: ${body}`);
        }

        const data = await res.json();
        const result = parseKindwiseResponse(data);
        console.log('[PlantID] kindwise success:', result.disease);
        const enriched = await enrichWithBedrock(result.disease);
        return { ...result, commonName: enriched.commonName, description: enriched.description };
    } catch (err2) {
        console.warn('[PlantID] kindwise failed:', err2.message);
    }

    // ── Attempt 3: Mock fallback ──────────────────────────────────────────────
    console.warn('[PlantID] Both APIs failed — returning mock result for demo');
    const mock = MOCK_DISEASES[Math.floor(Math.random() * MOCK_DISEASES.length)];
    return { ...mock, isMock: true };
};
