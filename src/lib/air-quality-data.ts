// Air Quality Parameter Definitions and Data Types

export type ParameterStatus = 'normal' | 'elevated' | 'high';

export interface AirQualityParameter {
  id: string;
  name: string;
  shortName: string;
  unit: string;
  referenceThreshold: number;
  elevatedThreshold: number;
  highThreshold: number;
  minValue: number;
  maxValue: number;
  decimals: number;
  colorClass: string;
  description: string;
}

export interface ParameterReading {
  parameterId: string;
  value: number;
  timestamp: Date;
  status: ParameterStatus;
  deviation: number; // percentage from reference
}

export interface DataPoint {
  timestamp: Date;
  [key: string]: number | Date;
}

export interface SessionData {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  samplingMode: 'pre-treatment' | 'post-treatment' | 'ambient';
  readings: DataPoint[];
}

export interface SystemStatus {
  deviceId: string;
  firmwareVersion: string;
  samplingRate: number; // seconds
  uptime: number; // seconds
  isConnected: boolean;
  sensors: SensorStatus[];
}

export interface SensorStatus {
  id: string;
  name: string;
  isConnected: boolean;
  lastReading: Date;
  hasFault: boolean;
  faultMessage?: string;
}

export interface AirflowStatus {
  isOn: boolean;
  mode: 'pre-treatment' | 'post-treatment' | 'ambient';
  duration: number; // seconds since mode started
}

// Parameter definitions with thresholds based on common air quality standards
export const AIR_QUALITY_PARAMETERS: AirQualityParameter[] = [
  {
    id: 'pm25',
    name: 'PM2.5',
    shortName: 'PM2.5',
    unit: 'μg/m³',
    referenceThreshold: 35,
    elevatedThreshold: 55,
    highThreshold: 150,
    minValue: 0,
    maxValue: 500,
    decimals: 1,
    colorClass: 'param-pm25',
    description: 'Fine Particulate Matter',
  },
  {
    id: 'co',
    name: 'Carbon Monoxide',
    shortName: 'CO',
    unit: 'ppm',
    referenceThreshold: 9,
    elevatedThreshold: 15,
    highThreshold: 35,
    minValue: 0,
    maxValue: 100,
    decimals: 2,
    colorClass: 'param-co',
    description: 'Carbon Monoxide Concentration',
  },
  {
    id: 'co2',
    name: 'Carbon Dioxide',
    shortName: 'CO₂',
    unit: 'ppm',
    referenceThreshold: 1000,
    elevatedThreshold: 2000,
    highThreshold: 5000,
    minValue: 300,
    maxValue: 10000,
    decimals: 0,
    colorClass: 'param-co2',
    description: 'Carbon Dioxide Concentration',
  },
  {
    id: 'so2',
    name: 'Sulfur Dioxide',
    shortName: 'SO₂',
    unit: 'ppb',
    referenceThreshold: 75,
    elevatedThreshold: 150,
    highThreshold: 300,
    minValue: 0,
    maxValue: 500,
    decimals: 1,
    colorClass: 'param-so2',
    description: 'Sulfur Dioxide Concentration',
  },
  {
    id: 'no2',
    name: 'Nitrogen Dioxide',
    shortName: 'NO₂',
    unit: 'ppb',
    referenceThreshold: 53,
    elevatedThreshold: 100,
    highThreshold: 200,
    minValue: 0,
    maxValue: 400,
    decimals: 1,
    colorClass: 'param-no2',
    description: 'Nitrogen Dioxide Concentration',
  },
  {
    id: 'o2',
    name: 'Oxygen',
    shortName: 'O₂',
    unit: '%',
    referenceThreshold: 20.9,
    elevatedThreshold: 19.5,
    highThreshold: 18.0,
    minValue: 0,
    maxValue: 25,
    decimals: 1,
    colorClass: 'param-o2',
    description: 'Oxygen Level',
  },
  {
    id: 'tvoc',
    name: 'Total VOC',
    shortName: 'TVOC',
    unit: 'ppb',
    referenceThreshold: 500,
    elevatedThreshold: 1000,
    highThreshold: 3000,
    minValue: 0,
    maxValue: 5000,
    decimals: 0,
    colorClass: 'param-tvoc',
    description: 'Total Volatile Organic Compounds',
  },
  {
    id: 'ch2o',
    name: 'Formaldehyde',
    shortName: 'CH₂O',
    unit: 'ppb',
    referenceThreshold: 50,
    elevatedThreshold: 100,
    highThreshold: 200,
    minValue: 0,
    maxValue: 500,
    decimals: 1,
    colorClass: 'param-ch2o',
    description: 'Formaldehyde Concentration',
  },
  {
    id: 'temp',
    name: 'Temperature',
    shortName: 'Temp',
    unit: '°C',
    referenceThreshold: 25,
    elevatedThreshold: 30,
    highThreshold: 35,
    minValue: -10,
    maxValue: 60,
    decimals: 1,
    colorClass: 'param-temp',
    description: 'Ambient Temperature',
  },
  {
    id: 'humidity',
    name: 'Humidity',
    shortName: 'RH',
    unit: '%',
    referenceThreshold: 60,
    elevatedThreshold: 70,
    highThreshold: 85,
    minValue: 0,
    maxValue: 100,
    decimals: 1,
    colorClass: 'param-humidity',
    description: 'Relative Humidity',
  },
];

// Helper function to get parameter status
export function getParameterStatus(param: AirQualityParameter, value: number): ParameterStatus {
  // Special case for O2 - lower is worse
  if (param.id === 'o2') {
    if (value < param.highThreshold) return 'high';
    if (value < param.elevatedThreshold) return 'elevated';
    return 'normal';
  }
  
  if (value >= param.highThreshold) return 'high';
  if (value >= param.elevatedThreshold) return 'elevated';
  return 'normal';
}

// Calculate deviation from reference
export function calculateDeviation(param: AirQualityParameter, value: number): number {
  const deviation = ((value - param.referenceThreshold) / param.referenceThreshold) * 100;
  return Math.round(deviation * 10) / 10;
}

// Format value with proper decimals
export function formatValue(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

// Generate mock sensor data with realistic fluctuations
export function generateMockValue(param: AirQualityParameter, baseValue?: number): number {
  const base = baseValue ?? (param.referenceThreshold * 0.8);
  const fluctuation = (Math.random() - 0.5) * param.referenceThreshold * 0.2;
  let value = base + fluctuation;
  
  // Clamp to valid range
  value = Math.max(param.minValue, Math.min(param.maxValue, value));
  
  return Math.round(value * Math.pow(10, param.decimals)) / Math.pow(10, param.decimals);
}

// Format duration in human readable format
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

// Format timestamp
export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

// Get status color class
export function getStatusColorClass(status: ParameterStatus): string {
  switch (status) {
    case 'normal': return 'text-status-normal';
    case 'elevated': return 'text-status-elevated';
    case 'high': return 'text-status-high';
  }
}

// Get status background class
export function getStatusBgClass(status: ParameterStatus): string {
  switch (status) {
    case 'normal': return 'bg-status-normal';
    case 'elevated': return 'bg-status-elevated';
    case 'high': return 'bg-status-high';
  }
}

// Get glow class for cards
export function getGlowClass(status: ParameterStatus): string {
  switch (status) {
    case 'normal': return 'glow-normal';
    case 'elevated': return 'glow-elevated';
    case 'high': return 'glow-high';
  }
}
