// Ajoutez ceci au début du fichier
const PORT = process.env.PORT || config.get('frontend.port') || 3000;

const path = require('path');
const { logger: rootLogger, mongo } = require('./helpers');
const { runBinance } = require('./server-binance');
const { runCronjob } = require('./server-cronjob');
const { runFrontend } = require('./server-frontend');
const { runErrorHandler } = require('./error-handler');

global.appRoot = path.resolve(__dirname);

(async () => {
  const logger = rootLogger.child({
    gitHash: process.env.GIT_HASH || 'unspecified'
  });

  runErrorHandler(logger);

  await mongo.connect(logger);

  await Promise.all([
    runBinance(logger),
    runCronjob(logger),
    runFrontend(logger)
  ]);
})();

// Modifiez le démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server started on port ${PORT}`);
});
// Après avoir chargé la config
const redisConfig = config.get('redis');
console.log("Redis Config:", redisConfig);

// Test de connexion Redis
if (redisConfig.enabled !== false) {
  const Redis = require('ioredis');
  const redisClient = new Redis(redisConfig);
  
  redisClient.on('connect', () => 
    console.log('✅ Redis connected successfully'));
  
  redisClient.on('error', (err) => 
    console.error('❌ Redis connection error:', err));
  
  // Test ping
  redisClient.ping((err, result) => {
    if (err) console.error('Redis ping failed:', err);
    else console.log('Redis ping response:', result);
  });
}
