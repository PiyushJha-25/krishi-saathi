import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import diaryRoutes from './diaryRoutes.js';
import mandiRoutes from './mandiRoutes.js';
import scanRoutes from './scanRoutes.js';
import chatRouter from './chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '20mb' }));

// Routes
app.get('/', (req, res) => {
    res.send('Krishi backend running');
});
app.use('/api/diary', diaryRoutes);
app.use('/api/mandi', mandiRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/chat', chatRouter);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
