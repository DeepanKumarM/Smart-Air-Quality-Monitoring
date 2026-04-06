import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  AIR_QUALITY_PARAMETERS,
  DataPoint,
  formatTimestamp,
} from '@/lib/air-quality-data';
import { Button } from '@/components/ui/button';

interface RealTimeChartProps {
  data: DataPoint[];
  selectedParameters: string[];
  onToggleParameter: (id: string) => void;
  timeRange: '5min' | '15min' | '1hour';
  onTimeRangeChange: (range: '5min' | '15min' | '1hour') => void;
}

const PARAM_COLORS: Record<string, string> = {
  pm25: 'hsl(280, 70%, 60%)',
  co: 'hsl(25, 90%, 55%)',
  co2: 'hsl(200, 80%, 55%)',
  so2: 'hsl(340, 75%, 60%)',
  no2: 'hsl(15, 85%, 55%)',
  o2: 'hsl(145, 70%, 50%)',
  tvoc: 'hsl(270, 65%, 60%)',
  ch2o: 'hsl(300, 70%, 55%)',
  temp: 'hsl(35, 95%, 55%)',
  humidity: 'hsl(195, 85%, 55%)',
};

const TIME_RANGES = {
  '5min': { label: '5 min', points: 150 },
  '15min': { label: '15 min', points: 450 },
  '1hour': { label: '1 hour', points: 1800 },
};

export function RealTimeChart({
  data,
  selectedParameters,
  onToggleParameter,
  timeRange,
  onTimeRangeChange,
}: RealTimeChartProps) {
  const filteredData = useMemo(() => {
    const maxPoints = TIME_RANGES[timeRange].points;
    return data.slice(-maxPoints);
  }, [data, timeRange]);

  const formattedData = useMemo(() => {
    return filteredData.map((point) => ({
      ...point,
      time: formatTimestamp(point.timestamp),
    }));
  }, [filteredData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="glass-card p-3 border border-border/50">
        <p className="text-xs text-muted-foreground mb-2 font-mono">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any) => {
            const param = AIR_QUALITY_PARAMETERS.find((p) => p.id === entry.dataKey);
            return (
              <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{param?.shortName}:</span>
                <span className="font-mono font-medium" style={{ color: entry.color }}>
                  {entry.value?.toFixed(param?.decimals ?? 1)} {param?.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Real-Time Trends</h3>
        <div className="flex items-center gap-2">
          {(Object.keys(TIME_RANGES) as Array<keyof typeof TIME_RANGES>).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTimeRangeChange(range)}
              className={cn(
                'text-xs h-7 px-2',
                timeRange === range && 'bg-primary text-primary-foreground'
              )}
            >
              {TIME_RANGES[range].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Parameter toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {AIR_QUALITY_PARAMETERS.map((param) => (
          <button
            key={param.id}
            onClick={() => onToggleParameter(param.id)}
            className={cn(
              'px-2 py-1 rounded-md text-xs font-medium transition-all duration-200',
              'border border-border/50',
              selectedParameters.includes(param.id)
                ? 'bg-secondary text-foreground'
                : 'bg-transparent text-muted-foreground hover:bg-secondary/50'
            )}
            style={{
              borderColor: selectedParameters.includes(param.id)
                ? PARAM_COLORS[param.id]
                : undefined,
            }}
          >
            <span className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-2 h-2 rounded-full transition-opacity',
                  selectedParameters.includes(param.id) ? 'opacity-100' : 'opacity-30'
                )}
                style={{ backgroundColor: PARAM_COLORS[param.id] }}
              />
              {param.shortName}
            </span>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 25%, 18%)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
              tickLine={{ stroke: 'hsl(215, 20%, 55%)' }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
              tickLine={{ stroke: 'hsl(215, 20%, 55%)' }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            {selectedParameters.map((paramId) => (
              <Line
                key={paramId}
                type="monotone"
                dataKey={paramId}
                stroke={PARAM_COLORS[paramId]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
