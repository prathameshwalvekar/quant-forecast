import axios from 'axios';

// Free stock data API - Using Alpha Vantage (you'll need a free API key)
// Alternative: Yahoo Finance API (no key required but less reliable)
const API_KEY = 'demo'; // Replace with actual API key for production
const BASE_URL = 'https://www.alphavantage.co/query';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

export interface TimeSeriesData {
  time: string;
  value: number;
}

// Fallback demo data for when API is not available
const generateDemoData = (symbol: string): { quote: StockQuote; timeSeries: TimeSeriesData[] } => {
  const basePrice = Math.random() * 200 + 50;
  const change = (Math.random() - 0.5) * 10;
  const changePercent = (change / basePrice) * 100;
  
  const timeSeries: TimeSeriesData[] = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 20;
    timeSeries.push({
      time: date.toISOString().split('T')[0],
      value: Math.max(basePrice + variation, 10),
    });
  }

  return {
    quote: {
      symbol,
      name: `${symbol} Inc.`,
      price: basePrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000000),
    },
    timeSeries,
  };
};

export const fetchStockQuote = async (symbol: string): Promise<StockQuote> => {
  try {
    // Try Alpha Vantage API
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: API_KEY,
      },
      timeout: 5000,
    });

    if (response.data['Error Message'] || response.data['Note']) {
      throw new Error('API limit reached or invalid symbol');
    }

    const quote = response.data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error('No data available');
    }

    return {
      symbol: quote['01. symbol'],
      name: `${symbol} Inc.`, // API doesn't provide company name in this endpoint
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
    };
  } catch (error) {
    console.warn('API fetch failed, using demo data:', error);
    return generateDemoData(symbol).quote;
  }
};

export const fetchTimeSeriesData = async (symbol: string): Promise<TimeSeriesData[]> => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol,
        apikey: API_KEY,
        outputsize: 'compact',
      },
      timeout: 5000,
    });

    if (response.data['Error Message'] || response.data['Note']) {
      throw new Error('API limit reached or invalid symbol');
    }

    const timeSeries = response.data['Time Series (Daily)'];
    if (!timeSeries) {
      throw new Error('No time series data available');
    }

    return Object.entries(timeSeries)
      .slice(0, 30)
      .map(([date, data]: [string, any]) => ({
        time: date,
        value: parseFloat(data['4. close']),
      }))
      .reverse();
  } catch (error) {
    console.warn('Time series API fetch failed, using demo data:', error);
    return generateDemoData(symbol).timeSeries;
  }
};

// Demo function to simulate RNN predictions
export const generatePredictions = (historicalData: TimeSeriesData[]): TimeSeriesData[] => {
  if (historicalData.length === 0) return [];

  const predictions: TimeSeriesData[] = [];
  const lastPrice = historicalData[historicalData.length - 1].value;
  const trend = historicalData.length > 1 
    ? historicalData[historicalData.length - 1].value - historicalData[historicalData.length - 2].value
    : 0;

  // Generate 7 days of predictions
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Simple prediction algorithm (in real app, this would be RNN/LSTM)
    const noise = (Math.random() - 0.5) * 5;
    const trendDecay = trend * (1 - i * 0.1);
    const predictedPrice = lastPrice + trendDecay + noise;
    
    predictions.push({
      time: date.toISOString().split('T')[0],
      value: Math.max(predictedPrice, lastPrice * 0.5), // Prevent negative prices
    });
  }

  return predictions;
};