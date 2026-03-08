
import express from 'express';
import db from './database.js';
import { generateFarmingAdvice } from './geminiService.js';
import { generateOfflineAdvice } from './offlineAdviceService.js';

const router = express.Router();

// Route 1: POST /
router.post('/', (req, res) => {
    const { entry_text, date } = req.body;

    const insertQuery = `
      INSERT INTO diary_entries (entry_text, date)
      VALUES (?, ?)
    `;

    db.run(insertQuery, [entry_text, date], function (err) {
        if (err) {
            console.error('Error inserting diary entry:', err);
            return res.status(500).json({ error: 'Failed to insert diary entry' });
        }

        const lastId = this.lastID;

        // Fetch the inserted entry
        db.get('SELECT * FROM diary_entries WHERE id = ?', [lastId], (err, row) => {
            if (err) {
                console.error('Error fetching inserted entry:', err);
                return res.status(500).json({ error: 'Failed to fetch inserted entry' });
            }
            res.status(201).json(row);
        });
    });
});

// Route 2: GET /
router.get('/', (req, res) => {
    db.all('SELECT * FROM diary_entries ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            console.error('Error fetching diary entries:', err);
            return res.status(500).json({ error: 'Failed to fetch diary entries' });
        }
        res.json(rows);
    });
});

// Route 3: GET /advice
router.get('/advice', async (req, res) => {
    db.all('SELECT * FROM diary_entries ORDER BY date DESC', [], async (err, rows) => {
        if (err) {
            console.error('Error fetching diary entries for advice:', err);
            return res.status(500).json({ error: 'Failed to generate advice' });
        }
        try {
            const advice = await generateFarmingAdvice(rows);
            res.json({ advice });
        } catch (error) {
            console.error('Error generating advice:', error);
            res.status(500).json({ error: 'Failed to generate advice' });
        }
    });
});

// Route 4: GET /offline-advice
router.get('/offline-advice', (req, res) => {
    db.all('SELECT * FROM diary_entries ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            console.error('Error fetching diary entries for offline advice:', err);
            return res.status(500).json({ error: 'Failed to generate offline advice' });
        }
        try {
            const advice = generateOfflineAdvice(rows);
            res.json({ advice, mode: "offline" });
        } catch (error) {
            console.error('Error generating offline advice:', error);
            res.status(500).json({ error: 'Failed to generate offline advice' });
        }
    });
});

// Route 5: PUT /:id
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { entry_text, date } = req.body;

    const updateQuery = `
        UPDATE diary_entries 
        SET entry_text = ?, date = ? 
        WHERE id = ?
    `;

    db.run(updateQuery, [entry_text, date, id], function (err) {
        if (err) {
            console.error('Error updating diary entry:', err);
            return res.status(500).json({ error: 'Failed to update diary entry' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        db.get('SELECT * FROM diary_entries WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Error fetching updated entry:', err);
                return res.status(500).json({ error: 'Failed to fetch updated entry' });
            }
            res.json(row);
        });
    });
});

// Route 6: DELETE /:id
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM diary_entries WHERE id = ?', [id], function (err) {
        if (err) {
            console.error('Error deleting diary entry:', err);
            return res.status(500).json({ error: 'Failed to delete diary entry' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json({ success: true, message: 'Entry deleted successfully' });
    });
});

export default router;

