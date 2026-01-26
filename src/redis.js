const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

// Error handling
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connection established');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
};

module.exports = { redisClient, connectRedis };