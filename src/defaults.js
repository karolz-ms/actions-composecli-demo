
const defaults = {
    REDIS_URL: 'redis://redis:6379',
    getRedisUrl: () => process.env.REDIS_URL ? process.env.REDIS_URL : defaults.REDIS_URL
};

module.exports = defaults;