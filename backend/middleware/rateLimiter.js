const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Ошибка подключения к Redis:', err));
redisClient.connect().catch(console.error);

const TIMEOUT_MINUTES = 5;
const MAX_ATTEMPTS = 5;

const rateLimiter = async (req, res, next) => {
  if (req.path !== '/api/login') {
    return next();
  }

  try {
    const { email } = req.body;
    if (!email) {
      return next();
    }

    const requests = await redisClient.get(email);
    const ttl = await redisClient.ttl(email);
    
    console.log(`Проверка лимита запросов для email ${email}: ${requests} попыток входа`);

    if (requests === null) {
      await redisClient.setEx(email, TIMEOUT_MINUTES * 60, '1');
      return next();
    }

    const requestCount = parseInt(requests);
    if (requestCount >= MAX_ATTEMPTS) {
      console.log(`Превышен лимит попыток входа для ${email}`);
      const remainingMinutes = Math.ceil(ttl / 60);
      return res.status(429).json({
        error: `Превышено количество попыток входа. Пожалуйста, попробуйте через ${remainingMinutes} минут.`
      });
    }

    await redisClient.setEx(email, TIMEOUT_MINUTES * 60, String(requestCount + 1));
    next();
  } catch (error) {
    console.error('Ошибка в работе rate limiter:', error);
    next();
  }
};

module.exports = { rateLimiter, redisClient };