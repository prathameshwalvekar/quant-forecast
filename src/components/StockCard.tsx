import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  prediction?: number;
  predictionChange?: number;
}

interface StockCardProps {
  data: StockData;
}

export const StockCard: React.FC<StockCardProps> = ({ data }) => {
  const isPositive = data.change >= 0;
  const isPredictionPositive = (data.predictionChange || 0) >= 0;

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card animate-slide-up">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{data.symbol}</h2>
            <p className="text-sm text-muted-foreground">{data.name}</p>
          </div>
          <Badge 
            variant={isPositive ? "default" : "destructive"}
            className={isPositive ? "bg-gain text-white" : "bg-loss text-white"}
          >
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {data.changePercent.toFixed(2)}%
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Current Price</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">${data.price.toFixed(2)}</p>
              <p className={`text-sm ${isPositive ? 'text-gain' : 'text-loss'}`}>
                {isPositive ? '+' : ''}${data.change.toFixed(2)}
              </p>
            </div>
          </div>

          {data.prediction && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-warning" />
                <span className="text-sm text-muted-foreground">AI Prediction</span>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-warning">${data.prediction.toFixed(2)}</p>
                {data.predictionChange && (
                  <p className={`text-sm ${isPredictionPositive ? 'text-gain' : 'text-loss'}`}>
                    {isPredictionPositive ? '+' : ''}${data.predictionChange.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="text-sm font-semibold text-foreground">{formatNumber(data.volume)}</p>
            </div>
            {data.marketCap && (
              <div>
                <p className="text-xs text-muted-foreground">Market Cap</p>
                <p className="text-sm font-semibold text-foreground">${formatNumber(data.marketCap)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};