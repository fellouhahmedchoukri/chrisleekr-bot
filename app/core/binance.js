// app/core/binance.js

async function getPositions({ symbol }) {
  try {
    const account = await this.client.accountInfo();
    return account.positions.filter(
      p => p.symbol === symbol && parseFloat(p.positionAmt) !== 0
    );
  } catch (error) {
    logger.error('getPositions error', error);
    return [];
  }
}

// Ajouter à l'export
module.exports = {
  ...,
  getPositions
};
