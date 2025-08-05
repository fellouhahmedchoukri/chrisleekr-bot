import React, { useState } from 'react';
import { TradingViewChart } from '@components/charts';

const GridConfigurator = () => {
  const [gridConfig, setGridConfig] = useState({
    upperPrice: 65000,
    lowerPrice: 55000,
    levels: 10,
    investment: 1000,
    stopLoss: 54000
  });

  const visualizeGrid = () => {
    // Génère visuellement la grille sur le chart
    TradingViewChart.drawGridLines(gridConfig);
  };

  return (
    <div className="config-card">
      <TradingViewChart symbol="BTCUSDT" interval="1h" />
      
      <div className="grid-controls">
        <input type="number" value={gridConfig.upperPrice} 
               onChange={e => setGridConfig({...gridConfig, upperPrice: e.target.value})} />
        
        <button onClick={visualizeGrid}>Visualiser la Grille</button>
        <button onClick={() => deployStrategy(gridConfig)}>Déployer le Bot</button>
      </div>
    </div>
  );
};
