// app/routes/tradingview.js

const express = require('express');
const router = express.Router();
const binance = require('../core/binance');
const logger = require('../core/logger');
const config = require('config');

router.post('/', async (req, res) => {
  const { passphrase, action, symbol, price, quantity } = req.body;

  // Vérification de la passphrase
  if (passphrase !== config.tradingview.webhookPassphrase) {
    logger.error('Invalid passphrase');
    return res.status(401).json({ error: 'Invalid passphrase' });
  }

  // Gestion des actions de la stratégie grid
  try {
    const cleanSymbol = symbol.replace(':', ''); // Nettoyage du symbole

    if (action === 'grid_buy') {
      // Placement d'un ordre limite d'achat
      const order = {
        symbol: cleanSymbol,
        side: 'BUY',
        type: 'LIMIT',
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timeInForce: 'GTC'
      };
      
      await binance.order(order);
      logger.info(`Placed grid buy order: ${cleanSymbol} @ ${price} x ${quantity}`);
      return res.json({ status: 'Placed grid buy order' });
    }

    if (action === 'grid_destroyed') {
      // Fermeture de toutes les positions
      const positions = await binance.getPositions({ symbol: cleanSymbol });
      
      let closedCount = 0;
      for (const position of positions) {
        const positionAmt = parseFloat(position.positionAmt);
        
        if (positionAmt !== 0) {
          const side = positionAmt > 0 ? 'SELL' : 'BUY';
          
          await binance.order({
            symbol: cleanSymbol,
            side: side,
            type: 'MARKET',
            quantity: Math.abs(positionAmt)
          });
          
          closedCount++;
          logger.info(`Closed position: ${cleanSymbol} ${side} ${Math.abs(positionAmt)}`);
        }
      }
      
      return res.json({ 
        status: 'Grid destroyed - positions closed',
        closedCount: closedCount
      });
    }

    // Si l'action n'est pas reconnue, passer au traitement standard
    logger.warn(`Unhandled grid action: ${action}`);
    return res.status(400).json({ error: 'Unhandled action type' });

  } catch (error) {
    logger.error(`Grid action error: ${error.message}`, {
      action,
      symbol,
      price,
      quantity
    });
    return res.status(500).json({ error: 'Failed to execute grid action' });
  }
});

module.exports = router;
