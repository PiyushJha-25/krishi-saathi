export const generateOfflineAdvice = (entries) => {
    // STEP 1 - Handle empty
    if (!entries || entries.length === 0) {
        return "Start logging your farm activities in the journal below to receive personalized guidance from Krishi Saathi.";
    }

    // STEP 2 - Calculate metrics from entries
    const entryCount = entries.length;

    // Check for some common basic keywords in the texts to give slightly tailored advice
    const fullText = entries.map(e => (e.entry_text || "").toLowerCase()).join(" ");

    const mentionsWater = fullText.includes("water") || fullText.includes("rain") || fullText.includes("irrigation");
    const mentionsFertilizer = fullText.includes("fertilizer") || fullText.includes("urea") || fullText.includes("potash") || fullText.includes("npk");
    const mentionsPest = fullText.includes("pest") || fullText.includes("insect") || fullText.includes("disease") || fullText.includes("spray");

    // STEP 3 - Build a detailed advice paragraph
    const lines = [];

    // Line 1 - Opening based on entry count
    if (entryCount >= 5) {
        lines.push(`You've been diligently logging your farm records with ${entryCount} recent entries! Consistent tracking is the best way to optimize your farm's profitability.`);
    } else {
        lines.push(`You have ${entryCount} activity logs. We recommend writing down any costs associated with your activities so you can track your total spending.`);
    }

    // Line 2 - Keyword specific advice
    if (mentionsWater) {
        lines.push(`We noticed you mentioned watering or rain. Ensure your fields have proper drainage to prevent waterlogging, which can damage roots and reduce yields.`);
    }
    if (mentionsFertilizer) {
        lines.push(`For fertilizers, remember that applying in split doses rather than all at once improves nutrient uptake and reduces waste.`);
    }
    if (mentionsPest) {
        lines.push(`When spraying for pests or diseases, aim for early morning or late afternoon when temperatures are cooler to prevent leaf burn and improve effectiveness.`);
    }

    // Line 3 - General guidance
    if (!mentionsWater && !mentionsFertilizer && !mentionsPest) {
        lines.push("Track your input-to-output ratio monthly. Write down your costs clearly in the journal to help AI identify the most profitable crop patterns for your next season.");
    }

    return lines.join(' ');
};
