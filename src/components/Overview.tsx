import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  BrainCircuit, 
  ArrowRight, 
  Clock, 
  Terminal, 
  Server, 
  ExternalLink,
  Sparkles,
  Database
} from 'lucide-react';
import { IncidentRecord, SystemStatus } from '../types/sentinel';

interface OverviewProps {
  incidents: IncidentRecord[];
  status: SystemStatus | null;
  onSelectIncident: (id: string, tab?: string) => void;
  onOpenNewAlert: () => void;
  onOpenCredentials: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  incidents,
  status,
  onSelectIncident,
  onOpenNewAlert,
  onOpenCredentials
}) => {
  const total = incidents.length;
  const criticalCount = incidents.filter(i => i.alert.severity === 'critical').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved' || i.status === 'confirmed_malicious' || i.status === 'false_positive').length;
  const memoryCount = status?.stats?.retainedMemoriesCount ?? 2;
  const influenceRate = status?.stats?.memoryInfluenceRate ?? 50;

  const fin04 = incidents.find(i => i.alert.affectedAsset === 'FIN-SRV-04');
  const fin07 = incidents.find(i => i.alert.affectedAsset === 'FIN-SRV-07');

  return (
    <div className="space-y-6">
      {/* Top Banner: Mandatory Demo Scenario */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0d1c38] via-[#0e172a] to-[#0c1322] border border-cyan-500/30 p-6 shadow-xl shadow-cyan-950/20">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SOC DEMO SCENARIO ACTIVE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Persistent SOC Memory in Action
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Experience SentinelOps' closed-loop organizational memory workflow. When you investigate <strong className="text-cyan-300">FIN-SRV-07</strong>, the system automatically queries <strong className="text-cyan-300">Hindsight</strong> to recall previous analyst findings from <strong className="text-cyan-300">FIN-SRV-04</strong> and augments Gemini's recommendations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {fin07 && (
              <button
                onClick={() => onSelectIncident(fin07.id, 'investigation')}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Investigate FIN-SRV-07</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}

            {fin04 && (
              <button
                onClick={() => onSelectIncident(fin04.id, 'investigation')}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>View FIN-SRV-04 Memory</span>
              </button>
            )}
          </div>
        </div>

        {/* Demo Timeline Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/80 pt-5">
          <div className="p-3.5 rounded-lg bg-[#0b1324]/70 border border-slate-800/80 flex items-start space-x-3">
            <div className="p-2 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-white">INCIDENT 1: FIN-SRV-04</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-mono">RESOLVED &amp; RETAINED</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                PowerShell execution via WMIC. Analyst confirmed malicious credential harvesting, isolated host, and retained remediation into Hindsight memory.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0b1324]/70 border border-cyan-800/40 flex items-start space-x-3">
            <div className="p-2 rounded bg-cyan-950/60 border border-cyan-700/50 text-cyan-400 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-white">INCIDENT 2: FIN-SRV-07</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono">READY FOR RECALL</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Identical encoded PowerShell pattern on sister finance host. Running investigation will recall FIN-SRV-04 learnings to provide contextual defense.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Incidents */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Incidents</span>
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{total}</span>
            <span className="text-xs text-slate-400">active alerts</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center space-x-1">
            <span className="text-cyan-400 font-mono">100%</span>
            <span>telemetry monitored</span>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-rose-900/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Critical Severity</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-rose-400">{criticalCount}</span>
            <span className="text-xs text-rose-300/80">require action</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-300/70 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>High priority queue</span>
          </div>
        </div>

        {/* Resolved Incidents */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-emerald-900/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Resolved / Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">{resolvedCount}</span>
            <span className="text-xs text-slate-400">mitigated</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/80">
            Analyst verified playbooks
          </div>
        </div>

        {/* Hindsight Memory Records */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-cyan-800/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Memory Records</span>
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">{memoryCount}</span>
            <span className="text-xs text-slate-400">retained</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 truncate">
            Bank: <span className="font-mono text-cyan-300">{status?.hindsight?.bankId || 'sentinelops'}</span>
          </div>
        </div>

        {/* Memory Influence Rate */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-blue-800/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Memory Influence</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-blue-400">{influenceRate}%</span>
            <span className="text-xs text-slate-400">augmented</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Guided by past incidents
          </div>
        </div>
      </div>

      {/* Main Split: Recent Security Activity & Memory Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Recent Security Activity
              </h2>
            </div>
            <button
              onClick={onOpenNewAlert}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              + Ingest Raw Alert
            </button>
          </div>

          <div className="space-y-3">
            {incidents.slice(0, 5).map((incident) => {
              const isResolved = incident.status === 'confirmed_malicious' || incident.status === 'resolved' || incident.status === 'false_positive';
              const hasMemory = incident.investigation?.memoryInformed;

              return (
                <div
                  key={incident.id}
                  onClick={() => onSelectIncident(incident.id, 'investigation')}
                  className="p-4 rounded-xl bg-[#0f172a] border border-slate-800/90 hover:border-cyan-500/40 hover:bg-[#111d35]/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          incident.alert.severity === 'critical'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                            : incident.alert.severity === 'high'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                        }`}>
                          {incident.alert.severity}
                        </span>

                        <span className="text-xs font-mono text-slate-400">
                          {incident.id}
                        </span>

                        {hasMemory && (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
                            <BrainCircuit className="w-3 h-3 text-cyan-400" />
                            <span>Memory Informed</span>
                          </span>
                        )}

                        {isResolved && (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Retained in Memory</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {incident.alert.title}
                      </h3>

                      <div className="flex items-center space-x-4 text-xs text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Server className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono text-slate-300">{incident.alert.affectedAsset}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Terminal className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono text-slate-300">{incident.alert.processName || 'N/A'}</span>
                        </span>
                        <span>{new Date(incident.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Organizational Memory Engine Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Memory Engine (Hindsight)
            </h2>
          </div>

          <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs text-slate-400">Hindsight Bank</span>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/50">
                {status?.hindsight?.bankId || 'sentinelops-soc-prod'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs text-slate-400">API Status</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                status?.hindsight?.status === 'connected'
                  ? 'bg-emerald-950 text-emerald-400'
                  : 'bg-amber-950 text-amber-300'
              }`}>
                {status?.hindsight?.status === 'connected' ? 'LIVE CONNECTED' : 'CREDENTIALS INFO'}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300">Tripartite Operations:</span>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span><strong className="text-slate-200">Retain:</strong> Extracts facts from incident feedback into knowledge graph.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span><strong className="text-slate-200">Recall:</strong> Multi-strategy search (Vector + BM25 + Graph) during triage.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span><strong className="text-slate-200">Reflect:</strong> Agentic synthesis over institutional SOC learnings.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenCredentials}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white font-medium flex items-center justify-center space-x-2 border border-slate-700 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Hindsight Cloud Config</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
