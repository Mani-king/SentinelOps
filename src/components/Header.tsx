import React from 'react';
import { 
  ShieldAlert, 
  BrainCircuit, 
  Sparkles, 
  Activity, 
  Database, 
  BarChart3, 
  Key, 
  RotateCcw,
  PlusCircle
} from 'lucide-react';
import { SystemStatus } from '../types/sentinel';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  status: SystemStatus | null;
  onOpenNewAlert: () => void;
  onResetDemo: () => void;
  onOpenCredentials: () => void;
  isResetting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  status,
  onOpenNewAlert,
  onResetDemo,
  onOpenCredentials,
  isResetting
}) => {
  const isHindsightConnected = status?.hindsight?.status === 'connected';

  return (
    <header className="bg-[#0c1222] border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-900/30 border border-cyan-400/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-wider text-white">SENTINEL<span className="text-cyan-400">OPS</span></span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  SOC v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI Incident Response &amp; Persistent Memory
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'incidents', label: 'Incident Center', icon: ShieldAlert },
              { id: 'investigation', label: 'AI Investigation', icon: Sparkles },
              { id: 'memory', label: 'Organizational Memory', icon: BrainCircuit },
              { id: 'analytics', label: 'Learning Analytics', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Status */}
          <div className="flex items-center space-x-3">
            {/* Hindsight Status Pill */}
            <button
              onClick={onOpenCredentials}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all border ${
                isHindsightConnected
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50 hover:bg-emerald-900/50'
                  : 'bg-amber-950/60 text-amber-300 border-amber-700/50 hover:bg-amber-900/50'
              }`}
              title="Click to view Hindsight Cloud & Gemini API status"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hindsight:</span>
              <span className="font-semibold">{isHindsightConnected ? 'Connected' : 'Credentials Info'}</span>
            </button>

            {/* Ingest Alert Button */}
            <button
              onClick={onOpenNewAlert}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-900/40 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ingest Alert</span>
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Reset to initial FIN-SRV-04 / FIN-SRV-07 Demo Scenario"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800/80">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'incidents', label: 'Incidents' },
            { id: 'investigation', label: 'Investigation' },
            { id: 'memory', label: 'Memory' },
            { id: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
