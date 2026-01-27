const { redisClient } = require('../redis');
const { generateShortCode } = require('../utils/shortCodeGenerator');
const { isValidUrl } = require('../utils/validator');

const URL_PREFIX = 'url:';
const CLICKS_PREFIX = 'clicks:';
const DEFAULT_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds

// Shortens a long URL
const shortenUrl = async (longUrl, expiryDays = 30) => {
  // Validate URL
  if (!isValidUrl(longUrl)) {
    throw new Error('Invalid URL provided');
  }

  // Generate unique short code (retry if collision)
  let shortCode;
  let attempts = 0;
  const maxAttempts = 5;

  do {
    shortCode = generateShortCode();
    const exists = await redisClient.exists(`${URL_PREFIX}${shortCode}`);
    
    if (!exists) break;
    
    attempts++;
  } while (attempts < maxAttempts);

  if (attempts === maxAttempts) {
    throw new Error('Failed to generate unique short code');
  }

  // Store in Redis with expiry
  const key = `${URL_PREFIX}${shortCode}`;
  const expirySeconds = expiryDays * 24 * 60 * 60;
  
  await redisClient.setEx(key, expirySeconds, longUrl);
  
  // Initialize click counter
  await redisClient.set(`${CLICKS_PREFIX}${shortCode}`, 0);
  await redisClient.expire(`${CLICKS_PREFIX}${shortCode}`, expirySeconds);

  return {
    shortCode,
    shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    longUrl,
    expiresIn: `${expiryDays} days`
  };
};


// Retrieves the original URL from a short code
const getOriginalUrl = async (shortCode) => {
  const key = `${URL_PREFIX}${shortCode}`;
  const longUrl = await redisClient.get(key);
  
  if (longUrl) {
    // Increment click counter
    await redisClient.incr(`${CLICKS_PREFIX}${shortCode}`);
  }
  
  return longUrl;
};


// Gets analytics for a short URL
const getAnalytics = async (shortCode) => {
  const urlKey = `${URL_PREFIX}${shortCode}`;
  const clicksKey = `${CLICKS_PREFIX}${shortCode}`;
  
  const [longUrl, clicks, ttl] = await Promise.all([
    redisClient.get(urlKey),
    redisClient.get(clicksKey),
    redisClient.ttl(urlKey)
  ]);
  
  if (!longUrl) {
    return null;
  }
  
  return {
    shortCode,
    longUrl,
    clicks: parseInt(clicks) || 0,
    expiresIn: ttl > 0 ? `${Math.ceil(ttl / 86400)} days` : 'expired'
  };
};

module.exports = {
  shortenUrl,
  getOriginalUrl,
  getAnalytics
};