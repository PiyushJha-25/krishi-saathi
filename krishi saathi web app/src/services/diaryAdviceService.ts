import type { DiaryAnalysisResult } from './diaryAnalysisService';

export function generateOfflineDiaryAdvice(analysis: DiaryAnalysisResult): string {
    if (analysis.entryCount === 0) {
        return "Start adding your farm activities to get AI-based guidance.";
    }

    const insights: string[] = [];

    // COST INSIGHT
    if (analysis.weeklySpending > 0) {
        insights.push(`You spent ₹${analysis.weeklySpending} in the last 7 days.`);

        if (analysis.weeklySpending > 5000) {
            insights.push("Your weekly spending is high. Try reducing input costs.");
        }

        if (analysis.previousWeekSpending > 0) {
            const trendAmount = analysis.weeklySpending - analysis.previousWeekSpending;
            if (trendAmount > 0) {
                insights.push(`Your spending increased by ₹${trendAmount} compared to last week. Try to control input costs to protect your profit.`);
            } else if (trendAmount < 0) {
                insights.push(`Great work! You reduced your expenses by ₹${Math.abs(trendAmount)} compared to last week. This will improve your profit margin.`);
            } else {
                insights.push("Your spending is consistent with last week. Maintaining this balance helps in planning better.");
            }
        }
    }

    // TOP CROP INSIGHT
    if (analysis.topCrop && analysis.topCrop !== 'None') {
        insights.push(`${analysis.topCrop} has the highest investment.`);
    }

    // TOP ACTIVITY INSIGHT
    if (analysis.topActivity && analysis.topActivity !== 'None') {
        insights.push(`${analysis.topActivity} is your biggest expense. Optimizing this can increase profit.`);
    }

    // CROP-SPECIFIC SMART TIP
    if (analysis.topCrop && analysis.topCrop !== 'None') {
        const cropMap: Record<string, string> = {
            'wheat': "Focus on proper irrigation scheduling next week.",
            'rice': "Monitor for pests in early growth stage.",
            'cotton': "Avoid excessive fertilizer usage.",
            'vegetables': "Track daily market prices for better selling time."
        };

        const cropLower = analysis.topCrop.toLowerCase();
        if (cropMap[cropLower]) {
            insights.push(cropMap[cropLower]);
        }
    }

    return insights.join('\n\n');
}
