require('dotenv').config();
const Redis = require('ioredis');
const logger = require('../src/utils/logger');

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisClient.on('error', (err) => {
  logger.error(err, '[Redis] Connection error');
});

redisClient.on('connect', () => {
  logger.info('[Redis] Connected');
});

module.exports = { redisClient };
