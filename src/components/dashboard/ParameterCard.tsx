import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  AirQualityParameter,
  ParameterReading,
  formatValue,
  formatTimestamp,
  getStatusColorClass,
  getGlowClass,
} from '@/lib/air-quality-data';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface ParameterCardProps {
  parameter: AirQualityParameter;
  reading: ParameterReading | undefined;
  onClick?: () => void;
  isSelected?: boolean;
}

export function ParameterCard({ parameter, reading, onClick, isSelected }: ParameterCardProps) {
  const value = reading?.value ?? 0;
  const status = reading?.status ?? 'normal';
  const deviation = reading?.deviation ?? 0;
  const timestamp = reading?.timestamp ?? new Date();

  const getDeviationIcon = () => {
    if (Math.abs(deviation) < 5) return <Minus className="w-4 h-4" />;
    if (deviation > 0) return <TrendingUp className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        'glass-card p-4 cursor-pointer transition-all duration-300 relative overflow-hidden',
        getGlowClass(status),
        isSelected && 'ring-2 ring-primary'
      )}
    >
      {/* Background glow effect */}
      <div 
        className={cn(
          'absolute inset-0 opacity-10 blur-2xl',
          status === 'normal' && 'bg-status-normal',
          status === 'elevated' && 'bg-status-elevated',
          status === 'high' && 'bg-status-high'
        )}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2.5 h-2.5 rounded-full',
              status === 'normal' && 'status-dot-normal',
              status === 'elevated' && 'status-dot-elevated',
              status === 'high' && 'status-dot-high'
            )} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {parameter.name}
            </span>
          </div>
          {status === 'high' && (
            <AlertTriangle className="w-4 h-4 text-status-high animate-pulse" />
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2 mb-2">
          <motion.span
            key={value}
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'param-value',
              getStatusColorClass(status)
            )}
          >
            {formatValue(value, parameter.decimals)}
          </motion.span>
          <span className="text-sm text-muted-foreground font-mono">
            {parameter.unit}
          </span>
        </div>

        {/* Deviation & Timestamp */}
        <div className="flex items-center justify-between text-xs">
          <div className={cn(
            'flex items-center gap-1',
            deviation > 0 ? 'text-status-elevated' : 'text-status-normal'
          )}>
            {getDeviationIcon()}
            <span className="font-mono">
              {deviation > 0 ? '+' : ''}{deviation}%
            </span>
          </div>
          <span className="text-muted-foreground font-mono">
            {formatTimestamp(timestamp)}
          </span>
        </div>

        {/* Progress bar showing position relative to thresholds */}
        <div className="mt-3 h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: `${Math.min(100, (value / parameter.highThreshold) * 100)}%` 
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full transition-colors duration-300',
              status === 'normal' && 'bg-status-normal',
              status === 'elevated' && 'bg-status-elevated',
              status === 'high' && 'bg-status-high'
            )}
          />
        </div>
      </div>
    </motion.div>
  );
}
