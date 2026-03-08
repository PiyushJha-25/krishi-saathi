
import express from 'express';
import db from './database.js';
import { generateFarmingAdvice } from './geminiService.js';
import { generateOfflineAdvice } from './offlineAdviceService.js';

const router = express.Router();

// Route 1: POST /
router.post('/', (req, res) => {
    const { entry_text, date } = req.body;

    try {
        const insertQuery = db.prepare(`
      INSERT INTO diary_entries (entry_text, date)
      VALUES (?, ?)
    `);

        const result = insertQuery.run(entry_text, date);

        // Fetch the inserted entry
        const fetchQuery = db.prepare('SELECT * FROM diary_entries WHERE id = ?');
        const insertedEntry = fetchQuery.get(result.lastInsertRowid);

        res.status(201).json(insertedEntry);
    } catch (error) {
        console.error('Error inserting diary entry:', error);
        res.status(500).json({ error: 'Failed to insert diary entry' });
    }
});

// Route 2: GET /
router.get('/', (req, res) => {
    try {
        const fetchQuery = db.prepare('SELECT * FROM diary_entries ORDER BY date DESC');
        const entries = fetchQuery.all();
        res.json(entries);
    } catch (error) {
        console.error('Error fetching diary entries:', error);
        res.status(500).json({ error: 'Failed to fetch diary entries' });
    }
});

// Route 3: GET /advice
router.get('/advice', async (req, res) => {
    try {
        const fetchQuery = db.prepare('SELECT * FROM diary_entries ORDER BY date DESC');
        const entries = fetchQuery.all();

        const advice = await generateFarmingAdvice(entries);
        res.json({ advice });
    } catch (error) {
        console.error('Error generating advice:', error);
        res.status(500).json({ error: 'Failed to generate advice' });
    }
});

// Route 4: GET /offline-advice
router.get('/offline-advice', (req, res) => {
    try {
        const fetchQuery = db.prepare('SELECT * FROM diary_entries ORDER BY date DESC');
        const entries = fetchQuery.all();

        const advice = generateOfflineAdvice(entries);
        res.json({ advice, mode: "offline" });
    } catch (error) {
        console.error('Error generating offline advice:', error);
        res.status(500).json({ error: 'Failed to generate offline advice' });
    }
});

// Route 5: PUT /:id
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { entry_text, date } = req.body;

    try {
        const updateQuery = db.prepare(`
            UPDATE diary_entries 
            SET entry_text = ?, date = ? 
            WHERE id = ?
        `);
        updateQuery.run(entry_text, date, id);

        const fetchQuery = db.prepare('SELECT * FROM diary_entries WHERE id = ?');
        const updatedEntry = fetchQuery.get(id);

        if (!updatedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json(updatedEntry);
    } catch (error) {
        console.error('Error updating diary entry:', error);
        res.status(500).json({ error: 'Failed to update diary entry' });
    }
});

// Route 6: DELETE /:id
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    try {
        const deleteQuery = db.prepare('DELETE FROM diary_entries WHERE id = ?');
        const result = deleteQuery.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json({ success: true, message: 'Entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting diary entry:', error);
        res.status(500).json({ error: 'Failed to delete diary entry' });
    }
});

export default router;
