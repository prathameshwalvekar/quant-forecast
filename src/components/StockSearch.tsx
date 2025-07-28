import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StockSearchProps {
  onStockSelect: (symbol: string) => void;
  isLoading?: boolean;
}

const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
];

export const StockSearch: React.FC<StockSearchProps> = ({ onStockSelect, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onStockSelect(searchTerm.toUpperCase());
      setSearchTerm('');
    }
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Stock Analysis</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Enter stock symbol (e.g., AAPL, GOOGL)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border focus:ring-primary"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !searchTerm.trim()}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {isLoading ? 'Loading...' : 'Analyze'}
          </Button>
        </form>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Stocks</h3>
          <div className="flex flex-wrap gap-2">
            {popularStocks.map((stock) => (
              <Badge
                key={stock.symbol}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onStockSelect(stock.symbol)}
              >
                {stock.symbol}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};