import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import readRoutes from './routes/readRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration to allow access from Vite frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Expose only the dynamic redirection route
app.use('/', readRoutes);

app.get('/', (req, res) => {
  res.send('📖 URL Shortener - Read/Redirect Microservice is Active.');
});

app.listen(PORT, () => {
  console.log(`⚡ Read Service running on: http://localhost:${PORT}`);
});
