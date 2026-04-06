import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAirQualityData } from '@/hooks/useAirQualityData';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ParameterCard } from '@/components/dashboard/ParameterCard';
import { RealTimeChart } from '@/components/dashboard/RealTimeChart';
import { ThresholdGauge } from '@/components/dashboard/ThresholdGauge';
import { AirflowStatusPanel } from '@/components/dashboard/AirflowStatusPanel';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { SystemStatusPanel } from '@/components/dashboard/SystemStatusPanel';
import { SessionsPanel } from '@/components/dashboard/SessionsPanel';

const Index = () => {
  const {
    readings,
    historicalData,
    parameters,
    systemStatus,
    airflowStatus,
    alerts,
    currentSession,
    sessions,
    startSession,
    stopSession,
    exportSessionData,
  } = useAirQualityData();

  const [selectedParameters, setSelectedParameters] = useState<string[]>(['pm25', 'co2', 'tvoc']);
  const [selectedParamForGauge, setSelectedParamForGauge] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'5min' | '15min' | '1hour'>('5min');

  const toggleParameter = (id: string) => {
    setSelectedParameters((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const gaugeParameters = useMemo(() => {
    if (selectedParamForGauge) {
      return parameters.filter((p) => p.id === selectedParamForGauge);
    }
    return parameters.slice(0, 6); // Show first 6 by default
  }, [parameters, selectedParamForGauge]);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <DashboardHeader />

      <main className="p-6">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Parameter Cards Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Live Parameters
              </h2>
              <span className="text-xs text-muted-foreground font-mono">
                {parameters.length} Sensors Active
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {parameters.map((param, index) => (
                <motion.div
                  key={param.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ParameterCard
                    parameter={param}
                    reading={readings.get(param.id)}
                    onClick={() => setSelectedParamForGauge(
                      selectedParamForGauge === param.id ? null : param.id
                    )}
                    isSelected={selectedParamForGauge === param.id}
                  />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Real-Time Chart */}
              <RealTimeChart
                data={historicalData}
                selectedParameters={selectedParameters}
                onToggleParameter={toggleParameter}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />

              {/* Threshold Gauges */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Threshold Analysis
                  </h2>
                  {selectedParamForGauge && (
                    <button
                      onClick={() => setSelectedParamForGauge(null)}
                      className="text-xs text-primary hover:underline"
                    >
                      Show all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gaugeParameters.map((param) => (
                    <ThresholdGauge
                      key={param.id}
                      parameter={param}
                      reading={readings.get(param.id)}
                    />
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - Status Panels */}
            <div className="space-y-4">
              {/* Alerts */}
              <AlertsPanel alerts={alerts} />

              {/* Airflow Status */}
              <AirflowStatusPanel
                status={airflowStatus}
                uptime={systemStatus.uptime}
              />

              {/* Sessions */}
              <SessionsPanel
                currentSession={currentSession}
                sessions={sessions}
                onStartSession={startSession}
                onStopSession={stopSession}
                onExportSession={exportSessionData}
              />

              {/* System Status */}
              <SystemStatusPanel status={systemStatus} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-4 mt-8">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>Generation-One Saver Pollution Control Pvt. Ltd.</span>
          <span className="font-mono">Data Refresh: 2s Interval</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
