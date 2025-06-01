import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ChartData, ChartOptions, registerables } from 'chart.js';
import { cn } from '@/lib/utils';

// Register all Chart.js components
ChartJS.register(...registerables);

export interface ChartProps {
  id: string;
  type: 'line' | 'bar' | 'radar' | 'doughnut' | 'pie' | 'polarArea' | 'bubble' | 'scatter';
  data: ChartData;
  options?: ChartOptions;
  className?: string;
  height?: number;
  width?: number;
  onCreated?: (chart: ChartJS) => void;
}

export function Chart({
  id,
  type,
  data,
  options,
  className,
  height = 300,
  width,
  onCreated,
}: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // If a chart already exists, destroy it
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create new chart
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const newChart = new ChartJS(ctx, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...options,
        },
      });
      
      chartRef.current = newChart;
      
      if (onCreated) {
        onCreated(newChart);
      }
    }

    // Clean up function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type, data, options, onCreated]);

  return (
    <div
      className={cn('chart-container relative', className)}
      style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }}
    >
      <canvas id={id} ref={canvasRef}></canvas>
    </div>
  );
}

export default Chart;
