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
