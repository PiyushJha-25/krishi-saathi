import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const getClient = () => new BedrockRuntimeClient({
    region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_BEDROCK_API_KEY || '',
        secretAccessKey: process.env.AWS_BEDROCK_SECRET_KEY || '',
    },
});

/**
 * Get market price advice for any crop from Amazon Bedrock (Nova Lite).
 * @param {string} cropName  - e.g. "Wheat", "Arhar", "Bajra"
 * @param {string} state     - e.g. "Maharashtra"
 * @param {number} quantity  - numeric amount
 * @param {string} unit      - "bags" | "quintals" | "kg"
 */
export const getMandiAdvice = async (cropName, state, quantity, unit, language = 'English') => {
    const quintals = unit === 'bags' ? quantity * 0.5 : unit === 'kg' ? quantity / 100 : quantity;
    const prompt = `You are Rajesh Sharma, a 35-year agricultural market expert who has worked with APMC mandis across India. A farmer in ${state} has ${quintals} quintals of ${cropName}.

Respond in ${language}.

Give your response in this exact structure:

PRICES:
- National Average Price: ₹X - ₹Y per quintal
- ${state} Local Mandi Price: ₹X - ₹Y per quintal  
- Government MSP (if applicable): ₹X per quintal
- Better option: [National/Local/MSP] — saves farmer ₹X per quintal

ADVICE:
[2-3 sentences: whether to sell now or wait, specific mandi name in that state, best time to go]

TIP:
[One specific negotiation or quality tip for this crop]

Translate ALL labels and section headers into ${language}. Do not keep any English labels if language is not English.
For example, if Hindi: "PRICES:" -> "कीमतें:", "ADVICE:" -> "सलाह:", "TIP:" -> "सुझाव:", "National Average Price" -> "राष्ट्रीय औसत मूल्य", "Local Mandi Price" -> "स्थानीय मंडी मूल्य", "Government MSP" -> "सरकारी MSP", "Better option" -> "बेहतर विकल्प", "saves farmer" -> "किसान को बचत", "per quintal" -> "प्रति क्विंटल".

Be specific with real price ranges. No generic advice. Sound like a real expert.`;

    const client = getClient();

    const command = new InvokeModelCommand({
        modelId: 'amazon.nova-lite-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            inferenceConfig: {
                maxTokens: 300,
                temperature: 0.7
            }
        })
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.output.message.content[0].text;
};

/**
 * Get short Hindi selling advice for voice playback.
 */
export const getHindiVoiceAdvice = async (cropName, state, bags, quintals) => {
    const prompt = `You are an experienced Indian farmer advisor who has 30 years of farming experience. 
A farmer has ${quintals} quintals of ${cropName} in ${state}.

Give him SHORT selling advice in Hindi (Devanagari script) in 3-4 sentences ONLY.
Speak like a wise experienced farmer friend, not like a robot.
Include: current price range, whether to sell now or wait, and one smart tip.
Use simple Hindi words that uneducated farmers understand.
Do NOT use English words. Keep it under 60 words total.`;

    const client = getClient();

    const command = new InvokeModelCommand({
        modelId: 'amazon.nova-lite-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
            messages: [
                {
                    role: 'user',
                    content: [{ text: prompt }]
                }
            ],
            inferenceConfig: {
                maxTokens: 150,
                temperature: 0.75
            }
        })
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.output.message.content[0].text;
};

export const getOfflineMandiAdvice = (cropName, state, quantity, unit) => {
    // Convert to quintals
    const quintals = unit === 'bags' ? quantity * 0.5 : unit === 'kg' ? quantity / 100 : quantity;

    // Hardcoded realistic price data
    const offlineData = {
        wheat: { msp: 2275, range: [2100, 2400], trend: 'rising', season: 'Rabi' },
        rice: { msp: 2300, range: [2100, 2500], trend: 'stable', season: 'Kharif' },
        maize: { msp: 2090, range: [1800, 2100], trend: 'falling', season: 'Kharif' },
        cotton: { msp: 7121, range: [6800, 7200], trend: 'rising', season: 'Kharif' },
        soybean: { msp: 4892, range: [4400, 5000], trend: 'stable', season: 'Kharif' },
        tomato: { msp: 0, range: [800, 1500], trend: 'falling', season: 'Zaid' },
        onion: { msp: 0, range: [1000, 2000], trend: 'rising', season: 'Rabi' },
        potato: { msp: 0, range: [900, 1200], trend: 'stable', season: 'Rabi' },
    };

    const crop = offlineData[cropName.toLowerCase()] || { msp: 0, range: [1000, 3000], trend: 'stable', season: 'Rabi' };
    const localPrice = crop.range[0] + Math.floor(Math.random() * (crop.range[1] - crop.range[0]));
    const totalEarnings = Math.round(quintals * (crop.msp > localPrice ? crop.msp : localPrice));

    // Smart advice based on real farming logic
    const customAdvice = {
        wheat: {
            rising: "Gehu ka bhav abhi achha hai aur agle kuch dino mein aur badh sakta hai. Punjab mein Amritsar APMC mein MSP se upar daam mil rahe hain. Agar 10-15 din storage kar sako toh 200-300 rupaye zyada milenge. Lekin moisture check zaroor karo pehle.",
            stable: "Gehu ka MSP 2275 rupaye hai aur local mandi mein 2100-2350 ke beech chal raha hai. Seedha APMC mandi mein jao, dalal se bachho - woh 200-300 rupaye commission lete hain. Subah 7-9 baje ka time sabse achha hota hai mandi mein.",
            falling: "Gehu ka bhav thoda neeche aa raha hai. Zyada der mat karo - abhi jo bhav hai woh theek hai. Quality ke hisaab se grade A ke 100-150 rupaye zyada milte hain, toh saf aur sukha gehu lekar jao mandi mein."
        },
        rice: "Dhan ka bhav is season mein stable hai. Basmati ke liye Punjab aur Haryana mein export demand zyada hai. Milling quality achhi ho toh 200-300 rupaye premium milta hai. FCI center mein bechne se MSP guaranteed milti hai.",
        maize: "Makka ka bhav abhi thoda daba hua hai kyunki poultry feed demand kam hui hai. Agar 3-4 hafte ruk sako toh bhav recover kar sakta hai. Warna nazdiki dal mill ya starch factory mein seedha contact karo - mandi se 150-200 zyada dete hain.",
        cotton: "Kapas ka bhav is saal CCI ke support se achha hai. Long staple cotton ke zyada daam milte hain - gin se pehle quality sort karo. Gujarat mein Rajkot APMC sabse bada cotton market hai. MSP se kam mein bilkul mat becho.",
        tomato: "Tamatar ka bhav bahut volatile hota hai. Abhi jo bhav hai, usme jaldi becho - zyada rakhne se nuksan hoga. Cold storage nahi hai toh 2-3 din mein bechna zaroori hai. Local sabzi mandi mein seedha jao, transport cost bachao.",
        onion: "Pyaz ka bhav abhi upar ja raha hai - storage mein rakha hai toh aur ruko. Nashik APMC India ka sabse bada pyaz market hai. Export quality ke liye 65mm se bada pyaz alag karo - uske 30-40% zyada daam milte hain.",
        potato: "Aalu ka bhav stable hai. Cold storage mein rakha hai toh March-April tak ruko - bhav 20-25% badh jata hai. Agra aur Mathura belt mein processing factories hain jo directly khareedti hain - unse contact karo better rate ke liye."
    };

    let baseAdvice = "";
    const cropKey = cropName.toLowerCase();

    if (cropKey === 'wheat') {
        baseAdvice = customAdvice.wheat[crop.trend] || customAdvice.wheat.stable;
    } else if (customAdvice[cropKey]) {
        baseAdvice = customAdvice[cropKey];
    } else {
        baseAdvice = "Apni fasal ki quality sorting karke alag karo - Grade A aur B alag rakhne se 15-20% zyada daam milta hai. Seedha APMC mandi mein registered commission agent se deal karo. Bechne se 2 din pehle agPASSA app ya mandi helpline se bhav check karo.";
    }

    const advice = `${baseAdvice} Aapke ${quantity} ${unit} se lagbhag ${totalEarnings.toLocaleString('en-IN')} rupaye ki kamai ho sakti hai.`;

    return {
        advice,
        isOffline: true,
        localPrice,
        msp: crop.msp,
        totalEarnings,
        quintals
    };
};
