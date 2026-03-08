import config from '../config';

const BASE_URL = `${config.API_BASE_URL}/api/diary`;

export interface DiaryEntry {
    id?: number;
    entry_text: string;
    date: string;
    created_at?: string;
}

export const saveDiaryEntry = async (entry: DiaryEntry) => {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entry),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving diary entry:', error);
        return null;
    }
};

export const getDiaryEntries = async () => {
    try {
        const response = await fetch(BASE_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching diary entries:', error);
        return [];
    }
};

export const updateDiaryEntry = async (id: number, text: string, date: string) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entry_text: text, date }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating diary entry:', error);
        return null;
    }
};

export const deleteDiaryEntry = async (id: number) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting diary entry:', error);
        return null;
    }
};

export const getAIAdvice = async (isLive: boolean) => {
    try {
        const endpoint = isLive ? `${BASE_URL}/advice` : `${BASE_URL}/offline-advice`;
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.advice;
    } catch (error) {
        console.error('Error fetching AI advice:', error);
        return "Unable to load advice. Please check your connection.";
    }
};
