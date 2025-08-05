// binance.js - Ajoutez cette méthode
async function getPositions({ symbol }) {
  try {
    const account = await client.accountInfo();
    return account.positions.filter(
      p => p.symbol === symbol && parseFloat(p.positionAmt) !== 0
    );
  } catch (error) {
    console.error('getPositions error:', error);
    return [];
  }
}

// Exportez la nouvelle méthode
module.exports = {
  getAccount,
  getPositions, // Nouveau
  order,
  // ... autres méthodes
};
