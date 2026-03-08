export interface DiaryEntry {
    cropName: string;
    activity: string;
    cost: number | string;
    date: string;
}

export interface DiaryAnalysisResult {
    totalCost: number;
    cropTotals: Record<string, number>;
    topCrop: string;
    activityTotals: Record<string, number>;
    topActivity: string;
    weeklySpending: number;
    previousWeekSpending: number;
    entryCount: number;
}

export function analyzeDiaryData(entries: DiaryEntry[]): DiaryAnalysisResult {
    let totalCost = 0;
    const cropTotals: Record<string, number> = {};
    const activityTotals: Record<string, number> = {};
    let weeklySpending = 0;
    let previousWeekSpending = 0;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    for (const entry of entries) {
        // Parse cost, ignore invalid or empty
        if (entry.cost === null || entry.cost === undefined || entry.cost === '') continue;
        const costValue = typeof entry.cost === 'string' ? parseFloat(entry.cost) : entry.cost;
        if (isNaN(costValue)) continue;

        const cropName = entry.cropName.trim() || 'Unknown';
        const activity = entry.activity.trim() || 'Unknown';

        totalCost += costValue;

        // Crop totals
        cropTotals[cropName] = (cropTotals[cropName] || 0) + costValue;

        // Activity totals
        activityTotals[activity] = (activityTotals[activity] || 0) + costValue;

        // Weekly spending
        if (entry.date) {
            const entryDate = new Date(entry.date);
            if (!isNaN(entryDate.getTime())) {
                if (entryDate > sevenDaysAgo && entryDate <= now) {
                    weeklySpending += costValue;
                } else if (entryDate >= fourteenDaysAgo && entryDate <= sevenDaysAgo) {
                    previousWeekSpending += costValue;
                }
            }
        }
    }

    // Find top crop
    let topCrop = 'None';
    let maxCropCost = -1;
    for (const [crop, cost] of Object.entries(cropTotals)) {
        if (cost > maxCropCost) {
            maxCropCost = cost;
            topCrop = crop;
        }
    }

    // Find top activity
    let topActivity = 'None';
    let maxActivityCost = -1;
    for (const [activity, cost] of Object.entries(activityTotals)) {
        if (cost > maxActivityCost) {
            maxActivityCost = cost;
            topActivity = activity;
        }
    }

    return {
        totalCost,
        cropTotals,
        topCrop,
        activityTotals,
        topActivity,
        weeklySpending,
        previousWeekSpending,
        entryCount: entries.length
    };
}
