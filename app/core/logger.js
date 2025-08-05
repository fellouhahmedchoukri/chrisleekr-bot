const bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: 'binance-bot',
  level: 'debug',
  serializers: bunyan.stdSerializers
});
