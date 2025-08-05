// tradingview.js - Ligne ~60 (dans le router.post)
const { action, symbol, price, quantity, passphrase } = req.body;

// Ajoutez ce bloc pour gérer les actions de votre stratégie
if (action === 'grid_buy') {
  const order = {
    symbol: symbol.replace(':', ''),
    side: 'BUY',
    type: 'LIMIT',
    price: parseFloat(price),
    quantity: parseFloat(quantity),
    timeInForce: 'GTC'
  };
  await binanceClient.order(order);
  return res.json({ status: 'Placed grid buy order' });
}

if (action === 'grid_destroyed') {
  const positions = await binanceClient.getPositions({ symbol });
  for (const position of positions) {
    if (parseFloat(position.positionAmt) !== 0) {
      await binanceClient.order({
        symbol,
        side: 'SELL',
        type: 'MARKET',
        quantity: Math.abs(parseFloat(position.positionAmt))
      });
    }
  }
  return res.json({ status: 'Grid destroyed - positions closed' });
}
