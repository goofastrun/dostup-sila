const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Ошибка подключения к Redis:', err));
redisClient.connect().catch(console.error);

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
    
    console.log(`Проверка лимита запросов для email ${email}: ${requests} попыток входа`);

    if (requests === null) {
      await redisClient.setEx(email, 300, '1');
      return next();
    }

    const requestCount = parseInt(requests);
    if (requestCount >= 5) {
      console.log(`Превышен лимит попыток входа для ${email}`);
      return res.status(429).json({
        error: 'Слишком много попыток входа. Пожалуйста, подождите 5 минут.'
      });
    }

    await redisClient.setEx(email, 300, String(requestCount + 1));
    next();
  } catch (error) {
    console.error('Ошибка в работе rate limiter:', error);
    next();
  }
};

module.exports = { rateLimiter, redisClient };