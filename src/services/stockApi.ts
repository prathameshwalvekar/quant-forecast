import axios from 'axios';

// Using Finnhub.io - Free tier provides 60 API calls per minute
// Sign up at https://finnhub.io/register to get your free API key
const FINNHUB_API_KEY = 'demo'; // Replace with your actual API key for production
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Alternative Yahoo Finance proxy (no API key needed but less reliable)
const YAHOO_PROXY_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

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

// Company names mapping for display
const COMPANY_NAMES: { [key: string]: string } = {
  'AAPL': 'Apple Inc.',
  'GOOGL': 'Alphabet Inc.',
  'MSFT': 'Microsoft Corporation',
  'TSLA': 'Tesla Inc.',
  'AMZN': 'Amazon.com Inc.',
  'NVDA': 'NVIDIA Corporation',
  'META': 'Meta Platforms Inc.',
  'NFLX': 'Netflix Inc.',
  'AMD': 'Advanced Micro Devices',
  'INTC': 'Intel Corporation',
};

// Fetch real-time stock quote using Finnhub
const fetchFromFinnhub = async (symbol: string): Promise<StockQuote> => {
  const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
    params: {
      symbol: symbol,
      token: FINNHUB_API_KEY,
    },
    timeout: 5000,
  });

  const data = response.data;
  if (!data.c || data.c === 0) {
    throw new Error('No data available from Finnhub');
  }

  const price = data.c; // Current price
  const change = data.d; // Change
  const changePercent = data.dp; // Change percent

  return {
    symbol,
    name: COMPANY_NAMES[symbol] || `${symbol} Inc.`,
    price,
    change,
    changePercent,
    volume: 0, // Finnhub basic plan doesn't include volume in quote endpoint
  };
};

// Fallback: Fetch from Yahoo Finance proxy
const fetchFromYahoo = async (symbol: string): Promise<StockQuote> => {
  const response = await axios.get(`${YAHOO_PROXY_URL}/${symbol}`, {
    timeout: 5000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  const data = response.data;
  const result = data?.chart?.result?.[0];
  
  if (!result || !result.meta) {
    throw new Error('No data available from Yahoo Finance');
  }

  const meta = result.meta;
  const price = meta.regularMarketPrice || meta.previousClose || 0;
  const previousClose = meta.previousClose || price;
  const change = price - previousClose;
  const changePercent = (change / previousClose) * 100;

  return {
    symbol,
    name: COMPANY_NAMES[symbol] || meta.longName || `${symbol} Inc.`,
    price,
    change,
    changePercent,
    volume: meta.regularMarketVolume || 0,
  };
};

// Generate fallback demo data
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
      name: COMPANY_NAMES[symbol] || `${symbol} Inc.`,
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
    // Try Finnhub first (more reliable)
    console.log(`Fetching real-time data for ${symbol} from Finnhub...`);
    return await fetchFromFinnhub(symbol);
  } catch (error) {
    console.warn('Finnhub failed, trying Yahoo Finance...', error);
    try {
      return await fetchFromYahoo(symbol);
    } catch (yahooError) {
      console.warn('Yahoo Finance failed, using demo data...', yahooError);
      return generateDemoData(symbol).quote;
    }
  }
};

export const fetchTimeSeriesData = async (symbol: string): Promise<TimeSeriesData[]> => {
  try {
    // For time series, we'll use Yahoo Finance as it's more accessible
    console.log(`Fetching historical data for ${symbol}...`);
    const response = await axios.get(`${YAHOO_PROXY_URL}/${symbol}`, {
      params: {
        range: '1mo',
        interval: '1d',
      },
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const data = response.data;
    const result = data?.chart?.result?.[0];
    
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      throw new Error('No historical data available');
    }

    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;

    return timestamps
      .map((timestamp: number, index: number) => ({
        time: new Date(timestamp * 1000).toISOString().split('T')[0],
        value: closes[index] || 0,
      }))
      .filter((item: TimeSeriesData) => item.value > 0)
      .slice(-30); // Last 30 days
  } catch (error) {
    console.warn('Historical data fetch failed, using demo data:', error);
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