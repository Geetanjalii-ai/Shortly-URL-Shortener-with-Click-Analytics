import express from 'express';
import dotenv from 'dotenv';
import readRoutes from './routes/readRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Expose only the dynamic redirection route
app.use('/', readRoutes);

app.get('/', (req, res) => {
  res.send('📖 URL Shortener - Read/Redirect Microservice is Active.');
});

app.listen(PORT, () => {
  console.log(`⚡ Read Service running on: http://localhost:${PORT}`);
});
