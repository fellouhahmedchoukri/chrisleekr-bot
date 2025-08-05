// app/services/grid-engine.js
const Binance = require('../core/binance');
const logger = require('../core/logger');
const config = require('config');

class GridEngine {
  constructor() {
    this.client = Binance.createClient(
      config.get('binance.test.apiKey'), 
      config.get('binance.test.apiSecret')
    );
  }

  async deployGridStrategy(params) {
    const { symbol, upperPrice, lowerPrice, levels, investment, stopLoss } = params;
    
    try {
      // 1. Annuler les ordres existants
      await this.client.cancelAllOrders(symbol);
      
      // 2. Calculer les niveaux de la grille
      const gridLevels = this.calculateGridLevels(
        parseFloat(upperPrice),
        parseFloat(lowerPrice),
        parseInt(levels),
        parseFloat(investment)
      );
      
      // 3. Placer les ordres
      const orders = [];
      for (const level of gridLevels) {
        const order = await this.client.order({
          symbol,
          side: 'BUY',
          type: 'LIMIT',
          price: level.price,
          quantity: level.quantity,
          timeInForce: 'GTC'
        });
        orders.push(order);
        logger.info(`Ordre placé: ${level.quantity} ${symbol} @ ${level.price}`);
      }
      
      // 4. Enregistrer le stop-loss
      if (stopLoss > 0) {
        await this.client.order({
          symbol,
          side: 'SELL',
          type: 'STOP_LOSS_LIMIT',
          stopPrice: stopLoss,
          price: stopLoss * 0.995,
          quantity: gridLevels.reduce((sum, level) => sum + level.quantity, 0),
          timeInForce: 'GTC'
        });
      }
      
      return orders;
      
    } catch (error) {
      logger.error('Erreur déploiement grille:', error);
      throw error;
    }
  }

  calculateGridLevels(upper, lower, levels, investment) {
    const range = upper - lower;
    const step = range / (levels - 1);
    const investmentPerLevel = investment / levels;
    
    return Array.from({length: levels}, (_, i) => {
      const price = upper - (i * step);
      return {
        price: parseFloat(price.toFixed(2)),
        quantity: parseFloat((investmentPerLevel / price).toFixed(6))
      };
    });
  }

  async closeGridPositions(symbol) {
    try {
      // 1. Annuler tous les ordres
      await this.client.cancelAllOrders(symbol);
      
      // 2. Fermer les positions
      const positions = await this.client.getPositions({ symbol });
      let closed = 0;
      
      for (const position of positions) {
        const amount = parseFloat(position.positionAmt);
        if (amount !== 0) {
          await this.client.order({
            symbol,
            side: amount > 0 ? 'SELL' : 'BUY',
            type: 'MARKET',
            quantity: Math.abs(amount)
          });
          closed++;
        }
      }
      
      return closed;
      
    } catch (error) {
      logger.error('Erreur fermeture grille:', error);
      throw error;
    }
  }
}

module.exports = new GridEngine();
