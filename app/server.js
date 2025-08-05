const express = require('express');
const config = require('config');
const app = express();
const logger = require('./core/logger'); // Assurez-vous que ce chemin est correct

// Middleware essentiel
app.use(express.json());

// Diagnostic initial
console.log("=== STARTUP DIAGNOSTICS ===");
console.log(`Node.js version: ${process.version}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`Platform: ${process.platform}/${process.arch}`);

// Configuration check
try {
  console.log("App Name:", config.get('appName'));
  console.log("Binance Test Mode:", config.get('binance.test.apiKey') ? "Enabled" : "Disabled");
  console.log("Redis Host:", config.get('redis.host') || 'Not configured');
} catch (e) {
  console.error("❌ Configuration error:", e.message);
  process.exit(1);
}

// Route de healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    node: process.version
  });
});

// Gestion des erreurs
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Le reste de votre application (routes, etc.)
// ... Insérez ici vos routes existantes ...

// Démarrage du serveur
const PORT = process.env.PORT || config.get('frontend.port') || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`🩺 Healthcheck: http://localhost:${PORT}/health`);
  
  // Test interne du healthcheck
  const http = require('http');
  const testRequest = http.get(`http://localhost:${PORT}/health`, (testRes) => {
    console.log(`Internal healthcheck test: ${testRes.statusCode === 200 ? 'SUCCESS' : 'FAILED'}`);
  });
  
  testRequest.on('error', (e) => {
    console.error('Internal healthcheck test FAILED:', e.message);
  });
});
