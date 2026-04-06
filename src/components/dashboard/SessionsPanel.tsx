import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SessionData, AIR_QUALITY_PARAMETERS, formatDuration } from '@/lib/air-quality-data';
import { Folder, Play, Square, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionsPanelProps {
  currentSession: SessionData | null;
  sessions: SessionData[];
  onStartSession: (name: string, mode: 'pre-treatment' | 'post-treatment' | 'ambient') => void;
  onStopSession: () => void;
  onExportSession: (sessionId: string) => void;
}

export function SessionsPanel({
  currentSession,
  sessions,
  onStartSession,
  onStopSession,
  onExportSession,
}: SessionsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionMode, setNewSessionMode] = useState<'pre-treatment' | 'post-treatment' | 'ambient'>('ambient');

  const handleStartSession = () => {
    const name = newSessionName.trim() || `Session ${sessions.length + 1}`;
    onStartSession(name, newSessionMode);
    setNewSessionName('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Sessions</h3>
          {currentSession && (
            <span className="px-1.5 py-0.5 bg-status-normal/20 text-status-normal text-xs rounded font-mono">
              RECORDING
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Current Session */}
          {currentSession ? (
            <div className="p-3 bg-status-normal/10 rounded-lg border border-status-normal/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{currentSession.name}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-status-normal animate-pulse" />
                  <span className="text-xs text-status-normal font-mono">REC</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Mode: {currentSession.samplingMode}</span>
                <span className="font-mono">{currentSession.readings.length} readings</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-3"
                onClick={onStopSession}
              >
                <Square className="w-3 h-3 mr-1" />
                Stop Session
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Session name..."
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <select
                value={newSessionMode}
                onChange={(e) => setNewSessionMode(e.target.value as any)}
                className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="ambient">Ambient</option>
                <option value="pre-treatment">Pre-Treatment</option>
                <option value="post-treatment">Post-Treatment</option>
              </select>
              <Button
                className="w-full"
                onClick={handleStartSession}
              >
                <Play className="w-3 h-3 mr-1" />
                Start Session
              </Button>
            </div>
          )}

          {/* Previous Sessions */}
          {sessions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider">
                Previous Sessions
              </h4>
              <div className="space-y-1 max-h-[150px] overflow-y-auto custom-scrollbar">
                {sessions.slice().reverse().map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-2 bg-muted/20 rounded-lg"
                  >
                    <div>
                      <p className="text-xs font-medium text-foreground">{session.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {session.readings.length} readings • {session.samplingMode}
                      </p>
                    </div>
                    <button
                      onClick={() => onExportSession(session.id)}
                      className="p-1.5 hover:bg-muted/50 rounded transition-colors"
                      title="Export CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
