// Ajouter cette fonction
async function cancelAllOrders(symbol) {
  try {
    const orders = await this.client.openOrders({ symbol });
    for (const order of orders) {
      await this.client.cancelOrder({
        symbol,
        orderId: order.orderId
      });
    }
    return true;
  } catch (error) {
    logger.error('cancelAllOrders error', error);
    return false;
  }
}

// Modifier l'export
module.exports = {
  // ... autres fonctions ...
  cancelAllOrders,
  getPositions
};
