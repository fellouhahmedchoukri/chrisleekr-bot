module.exports.closeAllPositions = async function(symbol) {
  try {
    const positions = await this.client.getPositions({ symbol });
    for (const position of positions) {
      if (parseFloat(position.positionAmt) !== 0) {
        await this.client.order({
          symbol,
          side: parseFloat(position.positionAmt) > 0 ? 'SELL' : 'BUY',
          type: 'MARKET',
          quantity: Math.abs(parseFloat(position.positionAmt))
        });
      }
    }
  } catch (error) {
    logger.error('closeAllPositions error', error);
  }
};
