require('dotenv').config();
const express = require('express');
const { redisClient, connectRedis } = require('./redis');
const urlRoutes = require('./routes/urlRoutes');
const { getOriginalUrl } = require('./services/urlService');

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

// API routes
app.use('/api', urlRoutes);

// Redirect route - handles short URLs
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const longUrl = await getOriginalUrl(shortCode);
    
    if (!longUrl) {
      return res.status(404).json({ 
        error: 'Short URL not found or expired' 
      });
    }
    
    // Redirect to original URL
    res.redirect(longUrl);
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error' 
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