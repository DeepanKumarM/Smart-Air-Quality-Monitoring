import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AirflowStatus, formatDuration } from '@/lib/air-quality-data';
import { Wind, Activity, Clock, Zap } from 'lucide-react';

interface AirflowStatusPanelProps {
  status: AirflowStatus;
  uptime: number;
}

export function AirflowStatusPanel({ status, uptime }: AirflowStatusPanelProps) {
  const getModeLabel = (mode: AirflowStatus['mode']) => {
    switch (mode) {
      case 'pre-treatment': return 'Pre-Treatment';
      case 'post-treatment': return 'Post-Treatment';
      case 'ambient': return 'Ambient';
    }
  };

  const getModeColor = (mode: AirflowStatus['mode']) => {
    switch (mode) {
      case 'pre-treatment': return 'text-status-elevated';
      case 'post-treatment': return 'text-status-normal';
      case 'ambient': return 'text-primary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Wind className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Airflow System</h3>
      </div>

      <div className="space-y-4">
        {/* Power Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              status.isOn ? 'status-dot-normal' : 'bg-muted-foreground'
            )} />
            <span className={cn(
              'text-sm font-medium font-mono',
              status.isOn ? 'text-status-normal' : 'text-muted-foreground'
            )}>
              {status.isOn ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Sampling Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Mode</span>
          </div>
          <span className={cn(
            'text-sm font-medium font-mono',
            getModeColor(status.mode)
          )}>
            {getModeLabel(status.mode)}
          </span>
        </div>

        {/* Sampling Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Duration</span>
          </div>
          <span className="text-sm font-mono text-foreground">
            {formatDuration(Math.floor(status.duration))}
          </span>
        </div>

        {/* System Uptime */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              System Uptime
            </span>
            <span className="text-sm font-mono text-primary">
              {formatDuration(uptime)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
