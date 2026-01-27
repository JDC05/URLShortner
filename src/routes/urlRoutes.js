const express = require('express');
const { shortenUrl, getOriginalUrl, getAnalytics } = require('../services/urlService');

const router = express.Router();

// POST /api/shorten
// Creates a shortened URL
router.post('/shorten', async (req, res) => {
  try {
    const { url, expiryDays } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required' 
      });
    }
    
    const result = await shortenUrl(url, expiryDays);
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({ 
      error: error.message 
    });
  }
});


// GET /api/analytics/:shortCode
// Gets analytics for a shortened URL

router.get('/analytics/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const analytics = await getAnalytics(shortCode);
    
    if (!analytics) {
      return res.status(404).json({ 
        error: 'Short URL not found or expired' 
      });
    }
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;