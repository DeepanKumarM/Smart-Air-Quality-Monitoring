import { motion } from 'framer-motion';
import { Activity, Database, Wifi } from 'lucide-react';

export function DashboardHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card/30 backdrop-blur-sm"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              <i>Air Quality Dashboard</i>
            </h1>
            <p className="text-xs text-muted-foreground">
              <i>Continuous Monitoring • Alerts • Analytics</i>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg border border-border/50">
          <Wifi className="w-3.5 h-3.5 text-status-normal" />
          <span className="text-xs font-mono text-muted-foreground">LIVE</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg border border-border/50">
          <Database className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-mono text-muted-foreground">SAMPLING: 2s</span>
        </div>
      </div>
    </motion.header>
  );
}
