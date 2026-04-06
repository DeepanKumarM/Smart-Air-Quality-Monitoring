import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AIR_QUALITY_PARAMETERS,
  AirQualityParameter,
  ParameterReading,
  DataPoint,
  SessionData,
  SystemStatus,
  SensorStatus,
  AirflowStatus,
  getParameterStatus,
  calculateDeviation,
  generateMockValue,
} from '@/lib/air-quality-data';

const SAMPLING_INTERVAL = 2000; // 2 seconds
const MAX_DATA_POINTS = 1800; // 1 hour at 2s intervals

// Generate initial mock system status
function generateInitialSystemStatus(): SystemStatus {
  return {
    deviceId: 'AQM-LAB-001',
    firmwareVersion: 'v2.4.1',
    samplingRate: 2,
    uptime: 0,
    isConnected: true,
    sensors: AIR_QUALITY_PARAMETERS.map((param) => ({
      id: param.id,
      name: param.name,
      isConnected: true,
      lastReading: new Date(),
      hasFault: false,
    })),
  };
}

// Generate initial airflow status
function generateInitialAirflowStatus(): AirflowStatus {
  return {
    isOn: true,
    mode: 'ambient',
    duration: 0,
  };
}

export interface UseAirQualityDataReturn {
  // Current readings
  readings: Map<string, ParameterReading>;
  
  // Historical data
  historicalData: DataPoint[];
  
  // Sessions
  currentSession: SessionData | null;
  sessions: SessionData[];
  
  // System status
  systemStatus: SystemStatus;
  airflowStatus: AirflowStatus;
  
  // Controls
  isRunning: boolean;
  startSession: (name: string, mode: AirflowStatus['mode']) => void;
  stopSession: () => void;
  setAirflowMode: (mode: AirflowStatus['mode']) => void;
  
  // Export
  exportSessionData: (sessionId: string) => void;
  
  // Parameter info
  parameters: AirQualityParameter[];
  
  // Alerts
  alerts: ParameterReading[];
}

export function useAirQualityData(): UseAirQualityDataReturn {
  const [readings, setReadings] = useState<Map<string, ParameterReading>>(new Map());
  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(generateInitialSystemStatus());
  const [airflowStatus, setAirflowStatus] = useState<AirflowStatus>(generateInitialAirflowStatus());
  const [isRunning, setIsRunning] = useState(true);
  
  const baseValuesRef = useRef<Map<string, number>>(new Map());
  const startTimeRef = useRef<Date>(new Date());
  
  // Initialize base values
  useEffect(() => {
    const baseValues = new Map<string, number>();
    AIR_QUALITY_PARAMETERS.forEach((param) => {
      // Start with values around reference threshold
      baseValues.set(param.id, param.referenceThreshold * (0.6 + Math.random() * 0.5));
    });
    baseValuesRef.current = baseValues;
  }, []);
  
  // Generate new readings
  const generateReadings = useCallback(() => {
    const now = new Date();
    const newReadings = new Map<string, ParameterReading>();
    const dataPoint: DataPoint = { timestamp: now };
    
    AIR_QUALITY_PARAMETERS.forEach((param) => {
      // Get base value and add some drift
      let baseValue = baseValuesRef.current.get(param.id) ?? param.referenceThreshold * 0.8;
      
      // Occasional spikes or dips
      if (Math.random() < 0.05) {
        baseValue *= 1 + (Math.random() - 0.5) * 0.3;
      }
      
      // Small drift over time
      baseValue += (Math.random() - 0.5) * param.referenceThreshold * 0.02;
      baseValue = Math.max(param.minValue, Math.min(param.maxValue * 0.8, baseValue));
      baseValuesRef.current.set(param.id, baseValue);
      
      const value = generateMockValue(param, baseValue);
      const status = getParameterStatus(param, value);
      const deviation = calculateDeviation(param, value);
      
      newReadings.set(param.id, {
        parameterId: param.id,
        value,
        timestamp: now,
        status,
        deviation,
      });
      
      dataPoint[param.id] = value;
    });
    
    return { newReadings, dataPoint };
  }, []);
  
  // Main data collection loop
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      const { newReadings, dataPoint } = generateReadings();
      
      setReadings(newReadings);
      
      setHistoricalData((prev) => {
        const updated = [...prev, dataPoint];
        // Keep only last MAX_DATA_POINTS
        if (updated.length > MAX_DATA_POINTS) {
          return updated.slice(-MAX_DATA_POINTS);
        }
        return updated;
      });
      
      // Update system uptime
      setSystemStatus((prev) => ({
        ...prev,
        uptime: Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000),
        sensors: prev.sensors.map((sensor) => ({
          ...sensor,
          lastReading: new Date(),
          // Occasional random fault simulation (very rare)
          hasFault: Math.random() < 0.001,
        })),
      }));
      
      // Update airflow duration
      setAirflowStatus((prev) => ({
        ...prev,
        duration: prev.duration + (SAMPLING_INTERVAL / 1000),
      }));
      
      // Update current session if active
      if (currentSession) {
        setCurrentSession((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            readings: [...prev.readings, dataPoint].slice(-MAX_DATA_POINTS),
          };
        });
      }
    }, SAMPLING_INTERVAL);
    
    return () => clearInterval(interval);
  }, [isRunning, generateReadings, currentSession]);
  
  // Start a new session
  const startSession = useCallback((name: string, mode: AirflowStatus['mode']) => {
    const newSession: SessionData = {
      id: `session-${Date.now()}`,
      name,
      startTime: new Date(),
      isActive: true,
      samplingMode: mode,
      readings: [],
    };
    
    setCurrentSession(newSession);
    setAirflowStatus((prev) => ({ ...prev, mode, duration: 0 }));
    setIsRunning(true);
  }, []);
  
  // Stop current session
  const stopSession = useCallback(() => {
    if (currentSession) {
      const completedSession: SessionData = {
        ...currentSession,
        endTime: new Date(),
        isActive: false,
      };
      setSessions((prev) => [...prev, completedSession]);
      setCurrentSession(null);
    }
  }, [currentSession]);
  
  // Set airflow mode
  const setAirflowMode = useCallback((mode: AirflowStatus['mode']) => {
    setAirflowStatus((prev) => ({ ...prev, mode, duration: 0 }));
  }, []);
  
  // Export session data as CSV
  const exportSessionData = useCallback((sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.readings.length === 0) return;
    
    const headers = ['timestamp', ...AIR_QUALITY_PARAMETERS.map((p) => p.id)];
    const rows = session.readings.map((reading) => {
      const row = [reading.timestamp.toISOString()];
      AIR_QUALITY_PARAMETERS.forEach((param) => {
        row.push(String(reading[param.id] ?? ''));
      });
      return row;
    });
    
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.name.replace(/\s+/g, '_')}_${session.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [sessions]);
  
  // Get current alerts (elevated or high readings)
  const alerts = Array.from(readings.values()).filter(
    (reading) => reading.status !== 'normal'
  );
  
  return {
    readings,
    historicalData,
    currentSession,
    sessions,
    systemStatus,
    airflowStatus,
    isRunning,
    startSession,
    stopSession,
    setAirflowMode,
    exportSessionData,
    parameters: AIR_QUALITY_PARAMETERS,
    alerts,
  };
}
