import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SystemStatus } from '@/lib/air-quality-data';
import { Cpu, Radio, AlertCircle, CheckCircle2, Settings } from 'lucide-react';

interface SystemStatusPanelProps {
  status: SystemStatus;
}

export function SystemStatusPanel({ status }: SystemStatusPanelProps) {
  const connectedSensors = status.sensors.filter((s) => s.isConnected).length;
  const faultySensors = status.sensors.filter((s) => s.hasFault).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">System Status</h3>
      </div>

      <div className="space-y-3">
        {/* Device Info */}
        <div className="p-3 bg-muted/20 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Device ID</span>
            <span className="font-mono text-foreground">{status.deviceId}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Firmware</span>
            <span className="font-mono text-primary">{status.firmwareVersion}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Sampling Rate</span>
            <span className="font-mono text-foreground">{status.samplingRate}s</span>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/10">
          <div className="flex items-center gap-2">
            <Radio className={cn(
              'w-4 h-4',
              status.isConnected ? 'text-status-normal' : 'text-status-high'
            )} />
            <span className="text-sm text-muted-foreground">Connection</span>
          </div>
          <span className={cn(
            'text-xs font-medium font-mono px-2 py-0.5 rounded',
            status.isConnected 
              ? 'bg-status-normal/20 text-status-normal' 
              : 'bg-status-high/20 text-status-high'
          )}>
            {status.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Sensor Status Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Sensors</span>
            <span className="font-mono">
              {connectedSensors}/{status.sensors.length} online
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            {status.sensors.map((sensor) => (
              <div
                key={sensor.id}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded text-xs',
                  sensor.hasFault 
                    ? 'bg-status-high/10' 
                    : sensor.isConnected 
                      ? 'bg-muted/20' 
                      : 'bg-muted/10'
                )}
              >
                {sensor.hasFault ? (
                  <AlertCircle className="w-3 h-3 text-status-high" />
                ) : sensor.isConnected ? (
                  <CheckCircle2 className="w-3 h-3 text-status-normal" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                )}
                <span className={cn(
                  'font-mono truncate',
                  sensor.hasFault ? 'text-status-high' : 'text-muted-foreground'
                )}>
                  {sensor.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Faults warning */}
        {faultySensors > 0 && (
          <div className="flex items-center gap-2 p-2 bg-status-high/10 rounded-lg border border-status-high/30">
            <AlertCircle className="w-4 h-4 text-status-high" />
            <span className="text-xs text-status-high">
              {faultySensors} sensor{faultySensors > 1 ? 's' : ''} reporting fault
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
