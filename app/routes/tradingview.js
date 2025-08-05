// app/services/grid-engine.js
const binance = require('../core/binance');
const logger = require('../core/logger');

module.exports = {
  async deployGridStrategy(params) {
    const { symbol, upperPrice, lowerPrice, levels, investment, stopLoss } = params;
    
    try {
      // 1. Annuler les ordres existants
      await binance.cancelAllOrders(symbol);
      
      // 2. Calculer les niveaux de la grille
      const gridLevels = this.calculateGridLevels(upperPrice, lowerPrice, levels, investment);
      
      // 3. Placer les ordres
      const orders = [];
      for (const level of gridLevels) {
        const order = await binance.order({
          symbol,
          side: 'BUY',
          type: 'LIMIT',
          price: level.price,
          quantity: level.quantity,
          timeInForce: 'GTC'
        });
        orders.push(order);
        logger.info(`Grid order placed: ${level.quantity} ${symbol} @ ${level.price}`);
      }
      
      // 4. Gérer le stop-loss
      if (stopLoss > 0) {
        await binance.order({
          symbol,
          side: 'SELL',
          type: 'STOP_LOSS_LIMIT',
          stopPrice: stopLoss,
          price: stopLoss * 0.995,
          quantity: gridLevels.reduce((sum, level) => sum + level.quantity, 0),
          timeInForce: 'GTC'
        });
        logger.info(`Stop-loss set @ ${stopLoss} for ${symbol}`);
      }
      
      return orders;
      
    } catch (error) {
      logger.error('Grid deployment failed:', error);
      throw error;
    }
  },

  calculateGridLevels(upper, lower, levels, investment) {
    const range = upper - lower;
    const step = range / (levels - 1);
    const investmentPerLevel = investment / levels;
    
    return Array.from({length: levels}, (_, i) => {
      const price = upper - (i * step);
      return {
        price: parseFloat(price.toFixed(6)),
        quantity: parseFloat((investmentPerLevel / price).toFixed(8))
      };
    });
  },

  async closeGridPositions(symbol) {
    try {
      // 1. Annuler tous les ordres
      await binance.cancelAllOrders(symbol);
      
      // 2. Fermer les positions
      const positions = await binance.getPositions({ symbol });
      let closedCount = 0;
      
      for (const position of positions) {
        const amount = parseFloat(position.positionAmt);
        if (amount !== 0) {
          await binance.order({
            symbol,
            side: amount > 0 ? 'SELL' : 'BUY',
            type: 'MARKET',
            quantity: Math.abs(amount)
          });
          closedCount++;
        }
      }
      
      return closedCount;
      
    } catch (error) {
      logger.error('Grid closure failed:', error);
      throw error;
    }
  }
};
