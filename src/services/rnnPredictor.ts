// RNN/LSTM Stock Price Prediction Service
// This is a simplified implementation - in production you'd use a trained model

export interface PredictionResult {
  nextPrice: number;
  confidence: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

// Simple moving average based prediction (placeholder for actual RNN)
export const predictWithSimpleRNN = (prices: number[]): PredictionResult => {
  if (prices.length < 5) {
    return {
      nextPrice: prices[prices.length - 1] || 0,
      confidence: 0.1,
      trend: 'neutral'
    };
  }

  // Calculate moving averages
  const shortMA = calculateMovingAverage(prices.slice(-5), 5);
  const longMA = calculateMovingAverage(prices.slice(-10), Math.min(10, prices.length));
  
  // Calculate price momentum
  const momentum = calculateMomentum(prices);
  
  // Simple prediction based on moving averages and momentum
  const lastPrice = prices[prices.length - 1];
  const trendStrength = (shortMA - longMA) / longMA;
  const momentumFactor = momentum * 0.1;
  
  // Predict next price
  const prediction = lastPrice * (1 + trendStrength + momentumFactor);
  
  // Determine trend
  let trend: 'bullish' | 'bearish' | 'neutral';
  if (trendStrength > 0.02) trend = 'bullish';
  else if (trendStrength < -0.02) trend = 'bearish';
  else trend = 'neutral';
  
  // Calculate confidence based on trend consistency
  const confidence = Math.min(Math.abs(trendStrength) * 5 + 0.3, 0.9);
  
  return {
    nextPrice: Math.max(prediction, lastPrice * 0.5), // Prevent unrealistic drops
    confidence,
    trend
  };
};

// Advanced LSTM-style prediction (simplified)
export const predictWithLSTM = async (prices: number[]): Promise<PredictionResult> => {
  // In a real implementation, this would:
  // 1. Preprocess the data (normalization, windowing)
  // 2. Load a pre-trained LSTM model
  // 3. Make predictions using the model
  // 4. Post-process the results
  
  // For now, we'll use a more sophisticated mathematical approach
  if (prices.length < 10) {
    return predictWithSimpleRNN(prices);
  }
  
  // Simulate LSTM processing with more complex calculations
  const volatility = calculateVolatility(prices);
  const seasonality = calculateSeasonality(prices);
  const support = calculateSupportLevel(prices);
  const resistance = calculateResistanceLevel(prices);
  
  const lastPrice = prices[prices.length - 1];
  
  // Weighted prediction considering multiple factors
  let prediction = lastPrice;
  prediction += seasonality * 0.3;
  prediction += (support + resistance) / 2 * 0.1;
  prediction *= (1 + (Math.random() - 0.5) * volatility * 0.1);
  
  // Determine trend based on recent price action
  const recentPrices = prices.slice(-5);
  const priceDirection = recentPrices[recentPrices.length - 1] - recentPrices[0];
  
  let trend: 'bullish' | 'bearish' | 'neutral';
  if (priceDirection > lastPrice * 0.02) trend = 'bullish';
  else if (priceDirection < -lastPrice * 0.02) trend = 'bearish';
  else trend = 'neutral';
  
  // Higher confidence for LSTM-style prediction
  const confidence = Math.min(0.4 + (1 - volatility) * 0.4, 0.85);
  
  return {
    nextPrice: Math.max(prediction, lastPrice * 0.7),
    confidence,
    trend
  };
};

// Helper functions
const calculateMovingAverage = (prices: number[], period: number): number => {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
  return sum / period;
};

const calculateMomentum = (prices: number[]): number => {
  if (prices.length < 2) return 0;
  const recent = prices.slice(-3);
  if (recent.length < 2) return 0;
  return (recent[recent.length - 1] - recent[0]) / recent[0];
};

const calculateVolatility = (prices: number[]): number => {
  if (prices.length < 2) return 0.1;
  
  const returns = prices.slice(1).map((price, i) => 
    Math.log(price / prices[i])
  );
  
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => 
    sum + Math.pow(ret - meanReturn, 2), 0
  ) / returns.length;
  
  return Math.sqrt(variance);
};

const calculateSeasonality = (prices: number[]): number => {
  // Simplified seasonality calculation
  if (prices.length < 7) return 0;
  
  const weeklyPattern = prices.slice(-7);
  const avgWeekly = weeklyPattern.reduce((sum, price) => sum + price, 0) / 7;
  const lastPrice = prices[prices.length - 1];
  
  return (lastPrice - avgWeekly) * 0.1;
};

const calculateSupportLevel = (prices: number[]): number => {
  if (prices.length < 5) return Math.min(...prices);
  
  const recentLows = prices.slice(-20);
  recentLows.sort((a, b) => a - b);
  return recentLows.slice(0, 3).reduce((sum, price) => sum + price, 0) / 3;
};

const calculateResistanceLevel = (prices: number[]): number => {
  if (prices.length < 5) return Math.max(...prices);
  
  const recentHighs = prices.slice(-20);
  recentHighs.sort((a, b) => b - a);
  return recentHighs.slice(0, 3).reduce((sum, price) => sum + price, 0) / 3;
};