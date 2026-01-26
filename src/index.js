require('dotenv').config();
const express = require('express');
const { redisClient, connectRedis } = require('./redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', async (req, res) => {
  try {
    await redisClient.ping();
    res.json({ 
      status: 'ok', 
      message: 'URL Shortener API is running',
      redis: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Service unavailable',
      redis: 'disconnected'
    });
  }
});

// Start server
const startServer = async () => {
  try {
    await connectRedis();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();