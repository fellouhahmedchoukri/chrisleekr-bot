const express = require('express');
const config = require('config');
const app = express();

// Middleware essentiel
app.use(express.json());

// Route de healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// Le reste de votre application
// ... vos routes et logique ...

const PORT = process.env.PORT || config.get('frontend.port') || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🩺 Healthcheck: http://localhost:${PORT}/health`);
});
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
const healthcheck = require('./healthcheck');
app.use(healthcheck);
// Diagnostic initial
console.log("=== ENVIRONMENT ===");
console.log(`Node.js: ${process.version}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`PORT: ${PORT}`);
console.log("===================");

// Vérification de la configuration
try {
  console.log("App Name:", config.get('appName'));
  console.log("Binance Test Mode:", config.get('binance.test.apiKey') ? "Enabled" : "Disabled");
} catch (e) {
  console.error("❌ Configuration error:", e.message);
  process.exit(1);
}

// Gestion des erreurs non catchées
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
