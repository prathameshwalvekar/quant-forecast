import React, { useState, useEffect } from 'react';
import { StockSearch } from '@/components/StockSearch';
import { StockCard } from '@/components/StockCard';
import { StockChart } from '@/components/StockChart';
import { fetchStockQuote, fetchTimeSeriesData, generatePredictions, TimeSeriesData } from '@/services/stockApi';
import { predictWithLSTM } from '@/services/rnnPredictor';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Brain, TrendingUp } from 'lucide-react';

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

const Index = () => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [predictions, setPredictions] = useState<TimeSeriesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStockSelect = async (symbol: string) => {
    setIsLoading(true);
    try {
      // Fetch stock quote and time series data
      const [quote, timeSeries] = await Promise.all([
        fetchStockQuote(symbol),
        fetchTimeSeriesData(symbol)
      ]);

      // Generate AI predictions
      const prices = timeSeries.map(item => item.value);
      const aiPrediction = await predictWithLSTM(prices);
      const futurePredictions = generatePredictions(timeSeries);

      setStockData({
        ...quote,
        prediction: aiPrediction.nextPrice,
        predictionChange: aiPrediction.nextPrice - quote.price,
      });
      setTimeSeriesData(timeSeries);
      setPredictions(futurePredictions);

      toast({
        title: "Analysis Complete",
        description: `${symbol} analysis with AI prediction (${Math.round(aiPrediction.confidence * 100)}% confidence)`,
      });
    } catch (error) {
      console.error('Error fetching stock data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stock data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Stock Predictor</h1>
              <p className="text-sm text-muted-foreground">Real-time analysis with neural network predictions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search and Stock Info */}
          <div className="lg:col-span-1 space-y-6">
            <StockSearch onStockSelect={handleStockSelect} isLoading={isLoading} />
            
            {stockData && (
              <StockCard data={stockData} />
            )}

            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Analyzing with AI...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="lg:col-span-2">
            {timeSeriesData.length > 0 ? (
              <StockChart
                data={timeSeriesData}
                predictions={predictions}
                title={`${stockData?.symbol} - Price History & AI Predictions`}
              />
            ) : (
              <div className="h-[500px] bg-gradient-card border border-border rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Welcome to AI Stock Predictor
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Search for a stock symbol to see real-time data, interactive charts, 
                    and AI-powered price predictions using recurrent neural networks.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
