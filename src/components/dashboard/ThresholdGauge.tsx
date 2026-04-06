import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  AirQualityParameter,
  ParameterReading,
  formatValue,
  getStatusColorClass,
} from '@/lib/air-quality-data';

interface ThresholdGaugeProps {
  parameter: AirQualityParameter;
  reading: ParameterReading | undefined;
}

export function ThresholdGauge({ parameter, reading }: ThresholdGaugeProps) {
  const value = reading?.value ?? 0;
  const status = reading?.status ?? 'normal';
  const deviation = reading?.deviation ?? 0;

  // Calculate position on the gauge (0-100%)
  const maxValue = parameter.highThreshold * 1.2;
  const percentage = Math.min(100, (value / maxValue) * 100);

  // Calculate marker positions for thresholds
  const referencePos = (parameter.referenceThreshold / maxValue) * 100;
  const elevatedPos = (parameter.elevatedThreshold / maxValue) * 100;
  const highPos = (parameter.highThreshold / maxValue) * 100;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            status === 'normal' && 'status-dot-normal',
            status === 'elevated' && 'status-dot-elevated',
            status === 'high' && 'status-dot-high'
          )} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {parameter.shortName}
          </span>
        </div>
        <span className={cn('text-sm font-mono font-bold', getStatusColorClass(status))}>
          {formatValue(value, parameter.decimals)} {parameter.unit}
        </span>
      </div>

      {/* Gauge bar */}
      <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden mb-2">
        {/* Threshold zones */}
        <div 
          className="absolute inset-y-0 left-0 bg-status-normal/20"
          style={{ width: `${elevatedPos}%` }}
        />
        <div 
          className="absolute inset-y-0 bg-status-elevated/20"
          style={{ left: `${elevatedPos}%`, width: `${highPos - elevatedPos}%` }}
        />
        <div 
          className="absolute inset-y-0 bg-status-high/20"
          style={{ left: `${highPos}%`, right: 0 }}
        />

        {/* Reference threshold marker */}
        <div
          className="absolute inset-y-0 w-0.5 bg-primary/50"
          style={{ left: `${referencePos}%` }}
        />

        {/* Current value */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            status === 'normal' && 'bg-status-normal',
            status === 'elevated' && 'bg-status-elevated',
            status === 'high' && 'bg-status-high'
          )}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>0</span>
        <span className="text-primary">{parameter.referenceThreshold} (ref)</span>
        <span className="text-status-elevated">{parameter.elevatedThreshold}</span>
        <span className="text-status-high">{parameter.highThreshold}</span>
      </div>

      {/* Deviation info */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Deviation from ref:</span>
        <span className={cn(
          'font-mono font-medium',
          deviation > 0 ? 'text-status-elevated' : 'text-status-normal'
        )}>
          {deviation > 0 ? '+' : ''}{deviation}%
        </span>
      </div>
    </div>
  );
}
