require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ai-agent-puj2.vercel.app'
  ]
}));
app.use(express.json());

// Routes
app.use('/api/reports', reportsRouter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'AI Investment Research Server is healthy' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open health check at: http://localhost:${PORT}/health`);
});
