import React from 'react';
import { 
  BarChart3, 
  BrainCircuit, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Server, 
  ArrowRight, 
  CheckCircle2, 
  Layers,
  Clock,
  Zap
} from 'lucide-react';
import { IncidentRecord, SystemStatus } from '../types/sentinel';

interface LearningAnalyticsProps {
  incidents: IncidentRecord[];
  status: SystemStatus | null;
  onSelectIncident: (id: string, tab?: string) => void;
}

export const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({
  incidents,
  status,
  onSelectIncident
}) => {
  const total = incidents.length;
  const memoryInformedCount = incidents.filter(i => i.investigation?.memoryInformed).length;
  const rememberedCount = status?.stats?.retainedMemoriesCount ?? 2;
  const recallQueriesCount = status?.stats?.recallQueriesCount ?? 4;
  const influenceRate = total > 0 ? Math.round((memoryInformedCount / total) * 100) : 50;

  return (
    <div className="space-y-6">
      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Incidents Remembered</span>
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white">{rememberedCount}</span>
            <span className="text-xs text-slate-400">knowledge units</span>
          </div>
          <p className="text-[11px] text-cyan-300">
            Retained in Hindsight bank
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Memory Recall Operations</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">{recallQueriesCount}</span>
            <span className="text-xs text-slate-400">queries executed</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Multi-strategy vector &amp; graph lookup
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Investigation Augmentation</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-purple-400">{influenceRate}%</span>
            <span className="text-xs text-slate-400">influence rate</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Recommendations guided by history
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>MTTR Acceleration</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-amber-400">~68%</span>
            <span className="text-xs text-slate-400">triage time saved</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Instant playbook reuse
          </p>
        </div>
      </div>

      {/* Case Study Comparison: The FIN PowerShell Campaign */}
      <div className="p-6 rounded-xl bg-[#0f172a] border border-cyan-800/40 shadow-xl space-y-5">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-700/50 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Memory Influence Case Study: The FIN Subnet PowerShell Lateral Campaign
            </h3>
            <p className="text-xs text-slate-400">
              Demonstrates how institutional memory prevents repeated blind triage across identical adversary tactics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Card 1: Incident 1 Baseline */}
          <div className="p-5 rounded-xl bg-[#090e1a] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400">INCIDENT 1 (BASELINE)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">FIN-SRV-04</span>
            </div>

            <h4 className="text-sm font-semibold text-white">
              PowerShell Execution on FIN-SRV-04
            </h4>

            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>
                <strong>Initial Investigation:</strong> First time encountering WMIC spawning obfuscated PowerShell on the finance subnet.
              </p>
              <p>
                <strong>Analyst Verdict:</strong> Confirmed malicious credential harvesting targeting <code className="text-cyan-300">svc-payroll</code>.
              </p>
              <p>
                <strong>Resolution Action:</strong> Host isolated, password rotated, C2 IP 198.51.100.24 blacklisted.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-mono flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Outcome Retained in Hindsight</span>
              </span>
              <button
                onClick={() => onSelectIncident('INC-2026-0891', 'investigation')}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View Incident &rarr;
              </button>
            </div>
          </div>

          {/* Card 2: Incident 2 Memory-Augmented */}
          <div className="p-5 rounded-xl bg-[#0a1426] border border-cyan-700/60 shadow-lg shadow-cyan-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">INCIDENT 2 (MEMORY AUGMENTED)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">FIN-SRV-07</span>
            </div>

            <h4 className="text-sm font-semibold text-white">
              PowerShell Execution on FIN-SRV-07
            </h4>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>Hindsight Memory Recall:</strong> Automatically matched FIN-SRV-04 memory record (96% relevance score).
              </p>
              <p>
                <strong>Augmented Recommendations:</strong> Gemini immediately identified the recurring attacker infrastructure and flagged that <code className="text-cyan-300">svc-payroll</code> compromise had moved laterally.
              </p>
              <p>
                <strong>Triage Acceleration:</strong> Playbook actions applied in minutes with zero guesswork.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-cyan-300 font-mono flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Memory Informed Confidence (98%)</span>
              </span>
              <button
                onClick={() => onSelectIncident('INC-2026-0895', 'investigation')}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Investigate FIN-SRV-07 &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Risk & Cluster Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3">
          <h4 className="text-xs font-mono uppercase font-bold text-slate-300">
            Subnet Threat Clustering
          </h4>
          <div className="space-y-2.5">
            {[
              { subnet: '10.0.12.0/24 (Finance Tier)', count: 2, severity: 'Critical Campaign' },
              { subnet: '10.0.4.0/24 (Storage Infrastructure)', count: 1, severity: 'Low Risk / FP' },
              { subnet: '10.0.18.0/24 (Workstations)', count: 1, severity: 'Under Review' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#090e1a] border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white block">{item.subnet}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{item.count} incident(s) correlated</span>
                </div>
                <span className="font-mono text-cyan-400 text-xs font-medium">
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3">
          <h4 className="text-xs font-mono uppercase font-bold text-slate-300">
            Institutional Memory Health
          </h4>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Memory Graph Entities:</span>
              <span className="font-mono text-cyan-400 font-bold">14 Nodes / 22 Edges</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Rerank Strategy:</span>
              <span className="font-mono text-slate-200">Reciprocal Rank Fusion (RRF)</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Knowledge Retention Rate:</span>
              <span className="font-mono text-emerald-400 font-bold">100% of Verified Verdicts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Autonomous Reasoning:</span>
              <span className="font-mono text-purple-400 font-bold">Hindsight Reflect Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
