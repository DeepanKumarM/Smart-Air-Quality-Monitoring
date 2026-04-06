import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ParameterReading, AIR_QUALITY_PARAMETERS, formatValue } from '@/lib/air-quality-data';
import { AlertTriangle, Bell, X } from 'lucide-react';
import { useState } from 'react';

interface AlertsPanelProps {
  alerts: ParameterReading[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const activeAlerts = alerts.filter((alert) => !dismissedAlerts.has(alert.parameterId));

  const dismissAlert = (parameterId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, parameterId]));
    // Auto-restore after 30 seconds
    setTimeout(() => {
      setDismissedAlerts((prev) => {
        const next = new Set(prev);
        next.delete(parameterId);
        return next;
      });
    }, 30000);
  };

  const getParam = (id: string) => AIR_QUALITY_PARAMETERS.find((p) => p.id === id);

  if (activeAlerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Alerts</h3>
        </div>
        <div className="text-center py-4">
          <div className="w-10 h-10 rounded-full bg-status-normal/20 flex items-center justify-center mx-auto mb-2">
            <span className="text-status-normal text-lg">✓</span>
          </div>
          <p className="text-sm text-muted-foreground">All parameters normal</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-status-elevated animate-pulse" />
        <h3 className="text-sm font-medium text-foreground">
          Alerts ({activeAlerts.length})
        </h3>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {activeAlerts.map((alert) => {
            const param = getParam(alert.parameterId);
            if (!param) return null;

            return (
              <motion.div
                key={alert.parameterId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg',
                  alert.status === 'high' ? 'bg-status-high/10 border border-status-high/30' : 'bg-status-elevated/10 border border-status-elevated/30'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    alert.status === 'high' ? 'status-dot-high' : 'status-dot-elevated'
                  )} />
                  <div>
                    <p className={cn(
                      'text-xs font-medium',
                      alert.status === 'high' ? 'text-status-high' : 'text-status-elevated'
                    )}>
                      {param.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatValue(alert.value, param.decimals)} {param.unit} 
                      <span className="ml-1">
                        ({alert.deviation > 0 ? '+' : ''}{alert.deviation}%)
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.parameterId)}
                  className="p-1 hover:bg-muted/50 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
