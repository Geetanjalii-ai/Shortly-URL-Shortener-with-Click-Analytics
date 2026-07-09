import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import writeRoutes from './routes/writeRoutes.js';

// Load our environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration to allow access from Vite frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware: Tells Express to automatically parse incoming JSON payloads in request bodies
app.use(express.json());

// Mount our URL router onto the main application
app.use('/', writeRoutes);

// Fallback Route: Handle any unmatched basic requests
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the URL Shortener API</h1><p>Use POST /api/v1/shorten to create links.</p>');
});

// Start our server and listen on the designated port
app.listen(PORT, () => {
  console.log(`📡 Server is running smoothly on: http://localhost:${PORT}`);
});