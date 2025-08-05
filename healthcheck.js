// healthcheck.js
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

module.exports = app;
