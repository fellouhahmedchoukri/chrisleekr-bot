import React from 'react';
import { 
  PortfolioSummary, 
  MarketOverview, 
  ActiveBots,
  PerformanceChart,
  AlertFeed
} from '@features';

const Dashboard = () => (
  <div className="dashboard-grid">
    <div className="panel portfolio-panel">
      <PortfolioSummary />
    </div>
    
    <div className="panel market-panel">
      <MarketOverview />
    </div>
    
    <div className="panel bots-panel">
      <ActiveBots />
    </div>
    
    <div className="panel chart-panel">
      <PerformanceChart />
    </div>
    
    <div className="panel alerts-panel">
      <AlertFeed />
    </div>
  </div>
);
