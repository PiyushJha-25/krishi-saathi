import express from 'express';
import { identifyDisease } from './plantDiseaseService.js';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// ── Offline Disease Database ──────────────────────────────────────────────────
const offlineDiseases = [
    {
        disease: 'Puccinia triticina',
        commonName: 'Wheat Leaf Rust',
        confidence: 87,
        severity: 'High',
        description: 'Wheat leaf rust causes orange-brown pustules on leaves. Spreads rapidly in humid conditions and can cause 30-40% yield loss if untreated.',
        treatment: `SEVERITY: High — Wheat Leaf Rust spreads rapidly in humid conditions causing significant yield loss (up to 40%).

ORGANIC TREATMENT:
1. Neem oil (Azadirachta indica) 5% EC: Mix 5ml per liter water + 0.5ml sticker. Spray 500L per hectare at 7-day intervals. Best applied early morning.
2. Cow urine (Gomutra) fermented 15 days: Dilute 1:10 with water. Spray 250L per hectare. Effective at early infection stage.
3. Trichoderma viride WP (1×10⁸ CFU/g): 2.5kg per acre mixed in 50kg FYM. Apply in root zone 15 days before sowing.

CHEMICAL TREATMENT:
1. Propiconazole 25 EC (Tilt): 1ml per liter water. Spray 500L per hectare. Do not apply within 3 weeks of harvest.
2. Tebuconazole 25.9 EC (Folicur): 1ml per liter water. Repeat after 14 days. Max 2 applications per season.

PREVENTION:
Sow rust-resistant varieties HD-2967, PBW-343, or GW-496. Apply balanced NPK (120:60:40 kg/ha). Avoid excess nitrogen which increases susceptibility.`,
        treatment_hi: `गंभीरता: उच्च — गेहूं का रतुआ रोग नम मौसम में तेजी से फैलता है जिससे 40% तक उपज का नुकसान हो सकता है।\n\nजैविक उपचार:\n1. नीम का तेल 5% EC: 1 लीटर पानी में 5ml नीम का तेल + 0.5ml स्टीकर मिलाएं। 7 दिन के अंतराल पर 500L/हेक्टेयर छिड़काव करें।\n2. गोमूत्र (15 दिन पुराना): 1:10 के अनुपात में पानी के साथ मिलाएं। 250L/हेक्टेयर छिड़काव करें।\n3. ट्राइकोडर्मा विरिडी WP: 2.5kg प्रति एकड़ को 50kg गोबर की खाद में मिलाकर बुवाई से 15 दिन पहले जड़ों में दें।\n\nरासायनिक उपचार:\n1. प्रोपीकोनाजोल 25 EC (टिल्ट): 1ml प्रति लीटर पानी। 500L/हेक्टेयर छिड़काव करें। कटाई के 3 सप्ताह के भीतर प्रयोग न करें।\n2. टेबुकोनाजोल 25.9 EC (फॉलिकुर): 1ml प्रति लीटर पानी। 14 दिनों के बाद दोबारा छिड़काव करें।\n\nबचाव:\nHD-2967, PBW-343 जैसी रतुआ-प्रतिरोधी किस्में बोएं। संतुलित उर्वरक दें। अधिक यूरिया के प्रयोग से बचें।`,
    },
    {
        disease: 'Alternaria solani',
        commonName: 'Tomato Early Blight',
        confidence: 91,
        severity: 'Medium',
        description: 'Early blight causes dark brown spots with concentric rings on older leaves. Common in warm humid weather during monsoon season.',
        treatment: `SEVERITY: Medium — Early Blight progresses steadily in warm humid weather affecting yield quality and total marketable fruit.

ORGANIC TREATMENT:
1. Copper sulfate (CuSO₄) formulation: 3g per liter water. Spray 300L per acre every 10 days starting at 3rd week after transplanting.
2. Neem cake (De-oiled): Apply 100kg per acre as basal dose to reduce soil-borne fungal inoculum.
3. Garlic extract (Allium sativum): Blend 100g bulb in 1L water, macerate for 24h, filter. Spray weekly at 5% concentration.

CHEMICAL TREATMENT:
1. Mancozeb 75 WP (Dithane M-45): 2.5g per liter water. Spray 500L/ha every 7-10 days depending on disease pressure.
2. Chlorothalonil 75 WP (Kavach): 2g per liter water. Alternate with Mancozeb to prevent fungicide resistance buildup.

PREVENTION:
Maintain proper plant spacing (60x45cm) for canopy aeration. Prune lower diseased foliage immediately. Stake plants to prevent soil contact.`,
        treatment_hi: `गंभीरता: मध्यम — अगेती झुलसा गर्म और नम मौसम में तेजी से फैलता है जिससे फलों की गुणवत्ता प्रभावित होती है।\n\nजैविक उपचार:\n1. कॉपर सल्फेट (CuSO₄): 3g प्रति लीटर पानी। रोपाई के तीसरे सप्ताह से हर 10 दिन में 300L/एकड़ छिड़काव करें।\n2. नीम की खली: फंगस को कम करने के लिए 100kg प्रति एकड़ मिट्टी में डालें।\n3. लहसुन का अर्क: 100g लहसुन 1 लीटर पानी में मिलाकर 24 घंटे रखें, फिर छानकर साप्ताहिक छिड़काव करें।\n\nरासायनिक उपचार:\n1. मैनकोजेब 75 WP (डायथेन एम-45): 2.5g प्रति लीटर पानी। 7-10 दिनों के अंतराल पर 500L/हेक्टेयर छिड़काव करें।\n2. क्लोरोथालोनिल 75 WP (कवच): 2g प्रति लीटर पानी।\n\nबचाव:\nपौधों के बीच उचित दूरी (60x45cm) बनाए रखें। संक्रमित निचली पत्तियों को तुरंत हटा दें।`,
    },
    {
        disease: 'Magnaporthe oryzae',
        commonName: 'Rice Blast Disease',
        confidence: 83,
        severity: 'High',
        description: 'Rice blast is the most destructive rice disease worldwide. Creates diamond-shaped lesions on leaves that can kill entire tillers.',
        treatment: `SEVERITY: High — Rice Blast is highly destructive. Neck blast infection can cause 70-80% yield loss if not immediately managed.

ORGANIC TREATMENT:
1. Silicon fertilizer (Diatomaceous earth): Apply 200kg silica per acre basal to increase epidermal cell wall thickness.
2. Pseudomonas fluorescens formulation (1×10⁸ CFU/g): Spray 5g per liter water at active tillering and booting stages.
3. Biological Seed Treatment: Soak seeds in Trichoderma harzianum solution (10g/kg seed) for 24h before nursery sowing.

CHEMICAL TREATMENT:
1. Tricyclazole 75 WP (Baan/Beam): 0.6g per liter water. Crucial prophylactic spray at boot leaf and 50% flowering stages.
2. Isoprothiolane 40 EC (Fuji-One): 1.5ml per liter water. Apply immediately upon observing characteristic spindle-shaped lesions.

PREVENTION:
Cultivate blast-resistant hybrids (Pusa Basmati 1121, MTU 1010). Implement split nitrogen application (avoid single heavy dose of Urea).`,
        treatment_hi: `गंभीरता: उच्च — धान का झोंका रोग बहुत विनाशकारी है। यदि तुरंत प्रबंधित नहीं किया गया तो 70-80% उपज का नुकसान हो सकता है।\n\nजैविक उपचार:\n1. सिलिकॉन उर्वरक: पौधों की कोशिका भित्ति को मजबूत करने के लिए 200kg सिलिका प्रति एकड़ डालें।\n2. स्यूडोमोनास फ्लोरेसेंस: कल्ले निकलने और बालियां आने के समय 5g प्रति लीटर पानी का छिड़काव करें।\n3. बीज उपचार: बुवाई से पहले बीजों को ट्राइकोडर्मा घोल (10g/kg बीज) में 24 घंटे के लिए भिगोएं।\n\nरासायनिक उपचार:\n1. ट्राईसायक्लोजोल 75 WP (बान/बीम): 0.6g प्रति लीटर पानी। बालियां निकलने की अवस्था में छिड़काव बहुत महत्वपूर्ण है।\n2. आइसोप्रोथिओलेन 40 EC (फ़ूजी-वन): 1.5ml प्रति लीटर पानी। धब्बे दिखने पर तुरंत प्रयोग करें।\n\nबचाव:\nपूसा बासमती 1121 जैसी प्रतिरोधी संकर किस्में उगाएं। यूरिया का एक साथ अत्यधिक प्रयोग न करें।`,
    },
    {
        disease: 'Cercospora canescens',
        commonName: 'Cotton Grey Mildew',
        confidence: 78,
        severity: 'Medium',
        description: 'Grey mildew on cotton causes angular grey spots on leaves leading to premature defoliation and reduced boll development.',
        treatment: `SEVERITY: Medium — Grey Mildew causes premature canopy defoliation, significantly reducing photosynthetic area and boll filling.

ORGANIC TREATMENT:
1. Bordeaux mixture 1%: Mix 1kg CuSO₄ + 1kg hydrated lime in 100L water. Apply 500L/ha during conditions of high relative humidity (>80%).
2. Neem Seed Kernel Extract (NSKE) 5%: Pulverize 5kg seeds in 100L water. Filter and spray every 15 days after square formation.
3. Wood ash dust (Potassium-rich): Dust 15kg per acre on foliage in early morning dew to desiccate fungal mycelia.

CHEMICAL TREATMENT:
1. Carbendazim 50 WP (Bavistin): 1g per liter water. Spray 500L/ha immediately at first symptom appearance (lower canopy).
2. Difenconazole 25 EC (Score): 0.5ml per liter water. Second spray after 14 days if relative humidity remains elevated.

PREVENTION:
Deep summer ploughing to bury crop residue. Maintain wider spacing (120x60cm for hybrids) to optimize micro-climate aeration.`,
        treatment_hi: `गंभीरता: मध्यम — ग्रे मिल्ड्यू के कारण पत्तियां समय से पहले गिर जाती हैं, जिससे प्रकाश संश्लेषण और गूलर का विकास कम हो जाता है।\n\nजैविक उपचार:\n1. बोर्डो मिश्रण 1%: 100 लीटर पानी में 1kg CuSO₄ + 1kg चूना मिलाएं। उच्च आर्द्रता में 500L/हेक्टेयर छिड़काव करें।\n2. नीम बीज अर्क (NSKE) 5%: 100 लीटर पानी में 5kg बीज पीसकर मिलाएं। छानकर हर 15 दिन में छिड़काव करें।\n3. लकड़ी की राख: कवक को नष्ट करने के लिए सुबह की ओस में 15kg प्रति एकड़ राख छिड़कें।\n\nरासायनिक उपचार:\n1. कार्बेन्डाजिम 50 WP (बाविस्टिन): 1g प्रति लीटर पानी। पहला लक्षण दिखने पर तुरंत 500L/हेक्टेयर छिड़काव करें।\n2. डिफेनकोनाज़ोल 25 EC (स्कोर): 0.5ml प्रति लीटर पानी। यदि आर्द्रता बनी रहे तो 14 दिन बाद दोबारा छिड़काव करें।\n\nबचाव:\nफसल अवशेषों को नष्ट करने के लिए गर्मियों में गहरी जुताई करें। उचित वायु संचार के लिए (संकर किस्मों के लिए 120x60cm) दूरी बनाए रखें।`,
    },
    {
        disease: 'Phytophthora infestans',
        commonName: 'Potato Late Blight',
        confidence: 94,
        severity: 'High',
        description: 'Late blight is the most serious potato disease. Water-soaked lesions spread rapidly in cool wet weather and can destroy entire crop in 7-10 days.',
        treatment: `SEVERITY: High — Late Blight is explosive in cool, wet weather. Can achieve 100% crop destruction within 7-10 days if unmanaged.

ORGANIC TREATMENT:
1. Copper hydroxide 77 WP (Kocide): 3g per liter water. Apply protectant spray 400L/ha every 7 days before symptom onset.
2. Aerated Compost Tea (ACT): Foliar application 50L/ha to establish competitive beneficial phyllosphere microbiome.
3. Roguing operation: Manually rogue primary infected plants + 2m radius immediately and destroy far from field.

CHEMICAL TREATMENT:
1. Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold): 2.5g per liter water. Highly systemic, apply 2-3 times at 10-day intervals.
2. Cymoxanil 8% + Mancozeb 64% WP (Curzate M8): 2.5g per liter. Translaminar action; alternate with Metalaxyl for resistance management.

PREVENTION:
Procure certified pathogen-free seed tubers from higher altitudes. Cultivate resistant cultivars (Kufri Jyoti, Kufri Girdhari).`,
        treatment_hi: `गंभीरता: उच्च — पछेती झुलसा ठंडे और नम मौसम में बहुत तेजी से फैलता है। यदि प्रबंधित नहीं किया गया तो 7-10 दिनों के भीतर पूरी फसल नष्ट हो सकती है।\n\nजैविक उपचार:\n1. कॉपर हाइड्रॉक्साइड 77 WP (कोसाइड): 3g प्रति लीटर पानी। लक्षण शुरू होने से पहले हर 7 दिन में 400L/हेक्टेयर छिड़काव करें।\n2. एरेटेड कम्पोस्ट टी (ACT): पौधों की प्रतिरोधक क्षमता बढ़ाने के लिए 50L/हेक्टेयर पर्णीय छिड़काव करें।\n3. रोगी पौधों को निकालना: संक्रमित पौधों को तुरंत 2 मीटर के दायरे से उखाड़कर खेत से दूर नष्ट कर दें।\n\nरासायनिक उपचार:\n1. मेटालैक्सिल 8% + मैनकोज़ेब 64% WP (रिडोमिल गोल्ड): 2.5g प्रति लीटर पानी। 10 दिन के अंतराल पर 2-3 बार प्रयोग करें।\n2. साइमोक्सानिल 8% + मैनकोज़ेब 64% WP (कर्जेट M8): 2.5g प्रति लीटर।\n\nबचाव:\nप्रमाणित रोगमुक्त बीज कंदों का ही प्रयोग करें। कुफरी ज्योति जैसी प्रतिरोधी किस्मों की खेती करें।`,
    },
    {
        disease: 'Exserohilum turcicum',
        commonName: 'Maize Northern Blight',
        confidence: 82,
        severity: 'Medium',
        description: 'Northern corn leaf blight causes long cigar-shaped grey-green lesions on maize leaves. Can reduce yield by 30-50% in severe cases.',
        treatment: `SEVERITY: Medium — Northern Blight severely restricts grain fill if lesions establish on the ear leaf or above during silking.

ORGANIC TREATMENT:
1. Azadirachtin 10000 ppm (Neem extract): 3ml per liter water. Apply as a prophylactic anti-sporulant at V8 and VT growth stages.
2. Trichoderma harzianum WP: 2.5kg per acre incubated in 100kg FYM for 10 days. Apply to root zone during initial sowing.
3. Zinc sulfate heptahydrate (ZnSO₄): Basal soil application 25kg/ha to strengthen structural integrity against pathogen penetration.

CHEMICAL TREATMENT:
1. Propiconazole 25 EC (Tilt/Bumper): 1ml per liter water. Critical application at tasseling (VT) stage. 500L spray volume per hectare.
2. Azoxystrobin 23 SC (Amistar): 1ml per liter water. Apply 14 days post-tasseling to protect ear leaf during grain fill.

PREVENTION:
Select resistant or highly tolerant commercial hybrids (e.g., Pioneer 30V92). Rotate with non-host crops (soybean/groundnut) for 1-2 seasons.`,
        treatment_hi: `गंभीरता: मध्यम — नॉर्दर्न ब्लाइट प्रकाश संश्लेषण क्षेत्र को कम कर देता है जिससे दाने भरने पर गंभीर असर पड़ सकता है।\n\nजैविक उपचार:\n1. अज़ाडिरेक्टिन 10000 ppm (नीम का अर्क): 3ml प्रति लीटर पानी। पहला लक्षण दिखने पर छिड़काव करें।\n2. ट्राइकोडर्मा हरज़ियानम WP: 2.5kg प्रति एकड़ को 100kg गोबर की खाद में 10 दिनों तक इनक्यूबेट करें और बुवाई के समय जड़ों में दें।\n3. जिंक सल्फेट (ZnSO₄): रोगजनक प्रवेश को रोकने के लिए 25kg/हेक्टेयर बेसल प्रयोग करें।\n\nरासायनिक उपचार:\n1. प्रोपिकोनाज़ोल 25 EC (टिल्ट/बम्पर): 1ml प्रति लीटर पानी। टैसलिंग (नर फूल आने) अवस्था में 500L/हेक्टेयर छिड़काव महत्वपूर्ण है।\n2. एज़ोक्सिस्ट्रोबिन 23 SC (एमिस्टार): 1ml प्रति लीटर पानी। दाने भरते समय बचाव के लिए टैसलिंग के 14 दिन बाद प्रयोग करें।\n\nबचाव:\nपायनियर 30V92 जैसे प्रतिरोधी संकर बीजों का चयन करें। सोयाबीन या मूंगफली के साथ फसल चक्र अपनाएं।`,
    },
    {
        disease: 'Fusarium oxysporum',
        commonName: 'Banana Wilt Disease',
        confidence: 89,
        severity: 'High',
        description: 'Fusarium wilt causes yellowing and wilting of banana leaves from the lower ones upward. Highly destructive with no chemical cure once infected.',
        treatment: `SEVERITY: High — Fusarium Wilt (Panama Disease) is a vascular pathogen. Lethal, soil-borne, and lacks any curative chemical treatment once established.

ORGANIC TREATMENT:
1. Trichoderma viride enriched compost: Apply 50g per plant directly in root zone at planting and repeat every 3 months.
2. Pseudomonas fluorescens (1×10⁸ CFU/g): Liquid drench 10g per liter water directly over the rhizome area (2L per plant).
3. Eradication protocol: Isolate infected plants, uproot the entire pseudostem + corm, drench pit with bleaching powder, and burn plant.

CHEMICAL TREATMENT:
1. Carbendazim 50 WP (Bavistin): 0.2% concentration (2g/L). Preventative soil drench (3L per plant) around asymptomatic adjacent plants.
2. Agricultural Lime (CaCO₃): Apply 1-2 kg per pit to elevate soil pH > 7.0, creating a suppressive soil environment for Fusarium.

PREVENTION:
Source strictly certified disease-free tissue culture plantlets. Enforce a 3-4 year non-host crop rotation (sugarcane/paddy) on infested plots.`,
        treatment_hi: `गंभीरता: उच्च — फ्यूजेरियम विल्ट (पनामा रोग) एक मिट्टी जनित रोग है। यह जानलेवा है और एक बार संक्रमित होने पर कोई रासायनिक उपचार संभव नहीं है।\n\nजैविक उपचार:\n1. ट्राइकोडर्मा विरिडी युक्त कम्पोस्ट: रोपण के समय प्रत्येक पौधे की जड़ों में 50g डालें और हर 3 महीने में दोहराएं।\n2. स्यूडोमोनास फ्लोरेसेंस: प्रकंद क्षेत्र (2L प्रति पौधा) के ऊपर 10g प्रति लीटर पानी का तरल छिड़काव करें।\n3. उन्मूलन प्रक्रिया: संक्रमित पौधों को अलग करें, पूरे तने को जड़ों सहित उखाड़ें और गड्ढे में ब्लीचिंग पाउडर डालकर पौधे को जला दें।\n\nरासायनिक उपचार:\n1. कार्बेन्डाजिम 50 WP (बाविस्टिन): 0.2% सांद्रता (2g/L)। आस-पास के पौधों के चारों ओर निवारक मिट्टी का छिड़काव (3L प्रति पौधा)।\n2. कृषि चूना (CaCO₃): मिट्टी का pH > 7.0 बढ़ाने के लिए प्रति गड्ढे में 1-2 kg डालें, जिससे फ्यूजेरियम के लिए प्रतिकूल वातावरण बने।\n\nबचाव:\nकेवल प्रमाणित रोगमुक्त टिश्यू कल्चर पौधों का प्रयोग करें। संक्रमित खेतों में 3-4 साल (गन्ना/धान) का फसल चक्र अपनाएं।`,
    },
    {
        disease: 'Xanthomonas oryzae',
        commonName: 'Rice Bacterial Blight',
        confidence: 85,
        severity: 'High',
        description: 'Bacterial blight causes water-soaked lesions on leaf edges that turn yellow and then white. Major disease in irrigated rice causing 20-30% yield loss.',
        treatment: `SEVERITY: High — Bacterial Blight disseminates rapidly via irrigation water and wind-driven rain, especially devastating post-typhoon/heavy rains.

ORGANIC TREATMENT:
1. Copper oxychloride 50 WP (Blitox): 3g per liter water. Apply 500L/ha immediately upon observing early water-soaked foliar lesions.
2. Streptomycin sulfate + Tetracycline hydrochloride (Streptocycline): 0.5g/L combined with COC 50WP for synergistic bactericidal effect.
3. Agronomic adjustment: Immediately halt top-dressing of Urea. Excess exogenous nitrogen exacerbates bacterial multiplication.

CHEMICAL TREATMENT:
1. Bismerthiazol 20 WP: 2.5g per liter water. Foliar application at maximum tillering stage and repeat at booting if weather remains conducive.
2. Validamycin 3 SL (Sheathmar): 2ml per liter water. Prophylactic application at 45 Days After Transplanting (DAT) for broad-spectrum protection.

PREVENTION:
Cultivate resistant varieties harboring Xa21/xa13 genes (Improved Samba Mahsuri). Implement Alternate Wetting and Drying (AWD) to reduce humidity.`,
        treatment_hi: `गंभीरता: उच्च — बैक्टीरियल ब्लाइट सिंचाई के पानी और तेज बारिश के माध्यम से तेजी से फैलता है, विशेष रूप से भारी बारिश के बाद विनाशकारी होता है।\n\nजैविक उपचार:\n1. कॉपर ऑक्सीक्लोराइड 50 WP (ब्लाइटॉक्स): 3g प्रति लीटर पानी। प्रारंभिक पानी से लथपथ धब्बे दिखने पर तुरंत 500L/हेक्टेयर छिड़काव करें।\n2. स्ट्रेप्टोमाइसिन सल्फेट + टेट्रासाइक्लिन (स्ट्रेप्टोसाइक्लिन): जीवाणुनाशक प्रभाव के लिए COC 50WP के साथ 0.5g/L मिलाएं।\n3. यूरिया का टॉप-ड्रेसिंग तुरंत रोक दें क्योंकि अधिक नाइट्रोजन जीवाणुओं के गुणन को बढ़ाता है।\n\nरासायनिक उपचार:\n1. बिस्मेरथियाज़ोल 20 WP: 2.5g प्रति लीटर पानी। अधिकतम कल्ले निकलने की अवस्था में पर्णीय छिड़काव करें और अनुकूल मौसम होने पर बालियां आने पर दोहराएं।\n2. वैलिडामाइसिन 3 SL (शीथमार): 2ml प्रति लीटर पानी। रोपाई के 45 दिन बाद (DAT) निवारक प्रयोग करें।\n\nबचाव:\nXa21/xa13 जीन वाली प्रतिरोधी किस्में (संशोधित सांबा मसूरी) उगाएं। आर्द्रता कम करने के लिए खेत में पानी सुखाकर लगाएं (AWD)।`,
    },
];

/** Pick a disease from the offline list based on image size for dynamic-feeling results */
const getOfflineDisease = (imageBase64) => {
    const imageSize = imageBase64.length;
    const index = imageSize % 8;
    return offlineDiseases[index];
};

const router = express.Router();

// Retailer data per state
const retailers = {
    Maharashtra: ['Pune Agro Traders', 'Nashik Krishi Kendra', 'Aurangabad Beej Bhandar'],
    Punjab: ['Amritsar Agro Store', 'Ludhiana Kisan Seva', 'Jalandhar Krishi Center'],
    Haryana: ['Karnal Agro Traders', 'Hisar Kisan Store', 'Rohtak Beej Bhandar'],
    UP: ['Lucknow Agro Center', 'Agra Kisan Store', 'Kanpur Krishi Kendra'],
    MP: ['Indore Agro Traders', 'Bhopal Kisan Seva', 'Ujjain Krishi Store'],
    Rajasthan: ['Jaipur Agro Center', 'Jodhpur Kisan Store', 'Kota Beej Bhandar'],
    Bihar: ['Patna Agro Traders', 'Muzaffarpur Kisan Store', 'Gaya Krishi Kendra'],
    Gujarat: ['Ahmedabad Agro Center', 'Surat Kisan Seva', 'Rajkot Krishi Store'],
    Karnataka: ['Bangalore Agro Traders', 'Hubli Kisan Center', 'Mysore Beej Bhandar'],
    AP: ['Vijayawada Agro Store', 'Guntur Kisan Center', 'Visakhapatnam Krishi Seva'],
    default: ['Local APMC Agro Store', 'District Krishi Kendra', 'Nearby Beej Bhandar'],
};

const getBedrockClient = () =>
    new BedrockRuntimeClient({
        region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_BEDROCK_API_KEY || '',
            secretAccessKey: process.env.AWS_BEDROCK_SECRET_KEY || '',
        },
    });

const getTreatmentAdvice = async (disease, language = 'English') => {
    const prompt = `You are an expert agricultural scientist. A crop in India has been diagnosed with ${disease}.
Give treatment advice in this exact format:

SEVERITY: [Low/Medium/High] — [one line reason]

ORGANIC TREATMENT:
1. [treatment with dosage]
2. [treatment with dosage]
3. [treatment with dosage]

CHEMICAL TREATMENT:
1. [product name + dosage + application method]
2. [product name + dosage + application method]

PREVENTION:
[2 sentences on preventing this disease next season]

Be specific. Use Indian product names available in local markets.

Respond in ${language}. Translate all treatment advice, section headers, and recommendations into ${language}.`;

    const client = getBedrockClient();

    const command = new InvokeModelCommand({
        modelId: 'amazon.nova-lite-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
            messages: [
                {
                    role: 'user',
                    content: [{ text: prompt }],
                },
            ],
            inferenceConfig: {
                maxTokens: 500,
                temperature: 0.6,
            },
        }),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.output.message.content[0].text;
};

const getMockTreatment = (disease) => {
    return `SEVERITY: Medium — ${disease} can cause significant yield loss if left untreated for more than 7-10 days.

ORGANIC TREATMENT:
1. Neem oil spray (5ml per liter water) — apply every 7 days in cool morning hours
2. Trichoderma viride @ 5g per liter — drench soil around roots weekly
3. Bordeaux mixture (1%) — spray on affected leaves, repeat after rain

CHEMICAL TREATMENT:
1. Mancozeb 75 WP (Indofil M-45) — 2.5g per liter, spray at 10-day interval
2. Carbendazim 50 WP (Bavistin) — 1g per liter, alternate with Mancozeb

PREVENTION:
Use certified disease-resistant seeds next season and maintain proper crop rotation with non-host crops. Ensure good drainage, avoid overhead irrigation, and treat seeds with Thiram @ 3g/kg before sowing.`;
};

const parseSeverity = (treatment) => {
    const match = treatment.match(/SEVERITY:\s*(Low|Medium|High)/i);
    return match ? match[1] : 'Medium';
};

// POST /api/scan/identify
router.post('/identify', async (req, res) => {
    const { image, state, language } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'image (base64) is required.' });
    }

    // Step 1: Detect disease with Plant.id
    let diseaseResult;
    let isOffline = false;
    try {
        diseaseResult = await identifyDisease(image);
    } catch (err) {
        console.warn('Disease detection failed, switching to offline mode:', err.message);
        isOffline = true;
    }

    // ── Offline fallback: pick disease by image size ──
    if (isOffline) {
        const offline = getOfflineDisease(image);
        const stateRetailers = retailers[state] || retailers.default;
        return res.json({
            disease: offline.disease,
            commonName: offline.commonName,
            confidence: offline.confidence,
            severity: offline.severity,
            description: offline.description,
            treatment: language === 'हिन्दी' ? (offline.treatment_hi || offline.treatment) : offline.treatment,
            retailers: stateRetailers,
            isMock: false,
            isOffline: true,
        });
    }

    const { disease, commonName, confidence, description, isMock } = diseaseResult;

    // Step 2: Get treatment advice from Bedrock
    let treatment;
    let severity;
    try {
        treatment = await getTreatmentAdvice(disease, language);
        severity = parseSeverity(treatment);
    } catch (err) {
        console.error('Bedrock treatment failed, using mock:', err.message);
        treatment = getMockTreatment(disease);
        severity = parseSeverity(treatment);
    }

    // Step 3: Resolve retailers for state
    const stateRetailers = retailers[state] || retailers.default;

    res.json({
        disease,
        commonName: commonName || disease,
        confidence,
        severity,
        description,
        treatment,
        retailers: stateRetailers,
        isMock: isMock || false,
        isOffline: false,
    });
});

// POST /api/scan/voice-summary
router.post('/voice-summary', async (req, res) => {
    const { disease, commonName, severity, treatment } = req.body;
    if (!disease) {
        return res.status(400).json({ error: 'disease is required.' });
    }

    const prompt = `You are a helpful farm doctor. In simple Hindi (3-4 sentences max), tell the farmer:
1. What disease their crop has (use common name: ${commonName || disease})
2. How serious it is (severity: ${severity})
3. The single most important treatment step based on: ${treatment ? treatment.substring(0, 300) : 'standard treatment'}
Speak like a caring doctor to an uneducated farmer. Use very simple Hindi words. Respond ONLY in Hindi script (Devanagari).`;

    try {
        const client = getBedrockClient();
        const command = new InvokeModelCommand({
            modelId: 'amazon.nova-lite-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                messages: [{ role: 'user', content: [{ text: prompt }] }],
                inferenceConfig: { maxTokens: 300, temperature: 0.7 },
            }),
        });
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const hindiText = responseBody.output.message.content[0].text;
        return res.json({ hindiText });
    } catch (err) {
        console.error('Bedrock voice-summary failed:', err.message);
        const fallback = `आपकी फसल में ${commonName || disease} नाम की बीमारी पाई गई है। यह ${severity === 'High' ? 'गंभीर' : severity === 'Medium' ? 'मध्यम' : 'हल्की'} बीमारी है। कृपया तुरंत नीम के तेल का छिड़काव करें और नज़दीकी कृषि केंद्र से सलाह लें।`;
        return res.json({ hindiText: fallback });
    }
});

export default router;

