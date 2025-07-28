import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { Card } from '@/components/ui/card';

interface StockChartProps {
  data: Array<{
    time: string;
    value: number;
  }>;
  predictions?: Array<{
    time: string;
    value: number;
  }>;
  title?: string;
}

export const StockChart: React.FC<StockChartProps> = ({ data, predictions, title }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<any>(null);
  const predictionSeriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'hsl(210 40% 98%)',
      },
      grid: {
        vertLines: { color: 'hsl(225 15% 20%)' },
        horzLines: { color: 'hsl(225 15% 20%)' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'hsl(225 15% 20%)',
      },
      timeScale: {
        borderColor: 'hsl(225 15% 20%)',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    chartRef.current = chart;

    // Main data series (area chart)
    const mainSeries = (chart as any).addAreaSeries({
      lineColor: 'hsl(217 100% 50%)',
      topColor: 'hsl(217 100% 50% / 0.4)',
      bottomColor: 'hsl(217 100% 50% / 0.0)',
      lineWidth: 2,
    });
    mainSeriesRef.current = mainSeries;

    // Predictions series (line chart)
    if (predictions && predictions.length > 0) {
      const predictionSeries = (chart as any).addLineSeries({
        color: 'hsl(45 100% 50%)',
        lineWidth: 2,
        lineStyle: 2, // dashed
      });
      predictionSeriesRef.current = predictionSeries;
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (mainSeriesRef.current && data.length > 0) {
      const formattedData = data.map(item => ({
        time: item.time,
        value: item.value,
      }));
      mainSeriesRef.current.setData(formattedData);
    }
  }, [data]);

  useEffect(() => {
    if (predictionSeriesRef.current && predictions && predictions.length > 0) {
      const formattedPredictions = predictions.map(item => ({
        time: item.time,
        value: item.value,
      }));
      predictionSeriesRef.current.setData(formattedPredictions);
    }
  }, [predictions]);

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <div className="p-6">
        {title && (
          <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
        )}
        <div ref={chartContainerRef} className="w-full" />
      </div>
    </Card>
  );
};