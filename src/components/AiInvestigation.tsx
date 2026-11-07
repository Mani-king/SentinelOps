import React, { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Server, 
  Terminal, 
  Flame, 
  Info, 
  FileText, 
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Layers,
  Lock,
  Search
} from 'lucide-react';
import { IncidentRecord, InvestigationAnalysis, RecalledMemory } from '../types/sentinel';
import { AnalystFeedbackForm } from './AnalystFeedback';

interface AiInvestigationProps {
  incidents: IncidentRecord[];
  activeIncidentId: string;
  onSelectIncident: (id: string) => void;
  onRunInvestigation: (id: string) => Promise<void>;
  onSubmitFeedback: (id: string, feedback: any) => Promise<void>;
  isInvestigating: boolean;
  onOpenCredentials: () => void;
}

export const AiInvestigation: React.FC<AiInvestigationProps> = ({
  incidents,
  activeIncidentId,
  onSelectIncident,
  onRunInvestigation,
  onSubmitFeedback,
  isInvestigating,
  onOpenCredentials
}) => {
  const [activeStepTab, setActiveStepTab] = useState<'analysis' | 'feedback'>('analysis');

  const currentIncident = incidents.find(i => i.id === activeIncidentId) || incidents[0];
  const analysis = currentIncident?.investigation;
  const recalledMemories = currentIncident?.recalledMemories || [];
  const hasMemories = recalledMemories.length > 0;

  if (!currentIncident) {
    return (
      <div className="p-12 text-center text-slate-400 bg-[#0f172a] rounded-xl border border-slate-800">
        No incident selected. Please select an incident from the Incident Center.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Incident Switcher & Header Bar */}
      <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Incident Select Dropdown */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-cyan-400">
                ACTIVE INVESTIGATION:
              </span>
              <span className="text-xs font-mono text-slate-400">
                {currentIncident.id}
              </span>
            </div>
            <select
              value={currentIncident.id}
              onChange={(e) => onSelectIncident(e.target.value)}
              className="mt-1 w-full bg-[#080d19] border border-slate-700 rounded-md py-1.5 px-2.5 text-xs text-white font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  [{inc.alert.severity.toUpperCase()}] {inc.alert.affectedAsset} - {inc.alert.title} ({inc.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onRunInvestigation(currentIncident.id)}
            disabled={isInvestigating}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/40 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isInvestigating ? 'animate-spin' : ''}`} />
            <span>{isInvestigating ? 'Querying Memory & Analyzing...' : analysis ? 'Re-run Investigation' : 'Run AI Investigation'}</span>
          </button>
        </div>
      </div>

      {/* Incident Telemetry Summary Card */}
      <div className="bg-[#0b1220] p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Affected Asset</span>
          <span className="text-cyan-300 font-bold">{currentIncident.alert.affectedAsset}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Process / Parent</span>
          <span className="text-slate-200 truncate block">
            {currentIncident.alert.processName || 'N/A'} (parent: {currentIncident.alert.parentProcess || 'N/A'})
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Source &amp; Dest IP</span>
          <span className="text-slate-200">
            {currentIncident.alert.sourceIp} &rarr; {currentIncident.alert.destinationIp || 'External'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Status</span>
          <span className="text-amber-300 uppercase font-semibold">{currentIncident.status}</span>
        </div>
      </div>

      {/* Investigation States */}
      {!analysis && !isInvestigating && (
        <div className="bg-[#0f172a] p-12 text-center rounded-xl border border-dashed border-slate-700 space-y-4">
          <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center mx-auto text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Investigation Pending</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click &quot;Run AI Investigation&quot; to execute the mandatory memory workflow: query Hindsight memory for similar historical attacks and synthesize recommendations with Gemini.
            </p>
          </div>
          <button
            onClick={() => onRunInvestigation(currentIncident.id)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch AI Investigation Now</span>
          </button>
        </div>
      )}

      {isInvestigating && (
        <div className="bg-[#0f172a] p-12 text-center rounded-xl border border-cyan-500/30 space-y-4 shadow-lg shadow-cyan-950/20">
          <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center mx-auto text-cyan-400 animate-pulse">
            <BrainCircuit className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Executing Multi-Step SOC Intelligence Workflow...</h3>
            <div className="text-xs text-slate-400 space-y-1 font-mono">
              <p className="text-cyan-300">1. Querying Hindsight memory bank for similar historical incidents...</p>
              <p className="text-slate-400">2. Correlating asset clusters and process lineage...</p>
              <p className="text-slate-500">3. Synthesizing MITRE ATT&amp;CK techniques and evidence vs assumptions with Gemini...</p>
            </div>
          </div>
        </div>
      )}

      {analysis && !isInvestigating && (
        <div className="space-y-6">
          {/* STEP 2 & 4: Hindsight Memory Recall Banner */}
          {hasMemories ? (
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#0c223a] via-[#0e1b30] to-[#0f172a] border border-cyan-500/40 shadow-xl shadow-cyan-950/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                    HINDSIGHT ORGANIZATIONAL MEMORY RECALLED ({recalledMemories.length} MATCH{recalledMemories.length > 1 ? 'ES' : ''} FOUND)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {recalledMemories[0].source === 'hindsight_cloud' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold">
                      HINDSIGHT CLOUD LIVE
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    TOP RELEVANCE: {((recalledMemories[0].relevanceScore || 0.95) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Recalled Memory Items */}
              <div className="space-y-2.5">
                {recalledMemories.slice(0, 3).map((mem, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-[#07101f]/80 border border-cyan-800/40 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white">
                          Prior Incident / Fact: {mem.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400">
                          {mem.verdict.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400">
                        Score: {((mem.relevanceScore || 0.85) * 100).toFixed(0)}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {mem.summary}
                    </p>

                    <div className="text-xs text-slate-400">
                      <strong className="text-cyan-300">Retained Playbook Resolution: </strong>
                      {mem.resolution}
                    </div>

                    {mem.keyFacts && mem.keyFacts.length > 0 && (
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center space-x-1.5 flex-wrap gap-1">
                        <span className="text-slate-500 font-mono text-[10px]">CORRELATED ENTITIES:</span>
                        {mem.keyFacts.map((fact, fIdx) => (
                          <span key={fIdx} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">
                            {fact.replace(/^Entity:\s*/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-xs text-cyan-200/90 flex items-start space-x-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Memory Influence:</strong> {analysis.memoryInfluenceSummary}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-slate-500" />
                <span>Hindsight Recall: No historical memory records matched this alert payload.</span>
              </div>
              <button
                onClick={onOpenCredentials}
                className="text-cyan-400 hover:text-cyan-300 font-mono"
              >
                Inspect Bank &rarr;
              </button>
            </div>
          )}

          {/* Primary Investigation Analysis Panel */}
          <div className="p-6 rounded-xl bg-[#0f172a] border border-slate-800 space-y-6">
            {/* Threat Verdict & Confidence */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    analysis.severity === 'critical'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                  }`}>
                    {analysis.severity}
                  </span>
                  <span className="text-xs text-slate-400">Threat Verdict</span>
                </div>
                <h2 className="text-xl font-extrabold text-white">
                  {analysis.threatVerdict}
                </h2>
              </div>

              {/* Confidence Gauge */}
              <div className="flex items-center space-x-3 bg-[#090e1a] p-3 rounded-lg border border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">CONFIDENCE</span>
                  <span className="text-lg font-bold font-mono text-cyan-400">{analysis.confidence}%</span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 flex items-center justify-center font-mono text-xs text-cyan-300 font-bold bg-cyan-950/40">
                  {analysis.confidence}
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono uppercase font-semibold text-slate-400">
                Executive Incident Summary
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed bg-[#0b1220] p-4 rounded-lg border border-slate-800/90">
                {analysis.summary}
              </p>
            </div>

            {/* MITRE ATT&CK Matrix Mapping */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono uppercase font-semibold text-slate-300">
                  MITRE ATT&amp;CK Tactics &amp; Techniques
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {analysis.mitreTechniques.map((tech, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#0b1220] border border-slate-800 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-400 font-bold">{tech.id}</span>
                      <span className="text-[10px] text-slate-400">{tech.tactic}</span>
                    </div>
                    <div className="text-xs font-semibold text-white mt-1">
                      {tech.name}
                    </div>
                    {tech.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {tech.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Suspicious Activity Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-mono uppercase font-semibold text-slate-300">
                  Suspicious Activity Explained
                </h4>
              </div>

              <ol className="space-y-2 list-decimal list-inside text-xs text-slate-300 bg-[#0b1220] p-4 rounded-lg border border-slate-800">
                {analysis.suspiciousActivityExplanation.map((point, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="text-slate-200">{point}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Evidence vs Assumptions Discipline */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono uppercase font-semibold text-slate-300">
                  Evidence vs Assumptions (Disciplined SOC Analysis)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Concrete Evidence */}
                <div className="p-4 rounded-lg bg-[#0b1220] border border-emerald-900/30 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold uppercase">Concrete Evidence (Telemetry Facts)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                    {analysis.evidence.map((item, idx) => (
                      <li key={idx} className="leading-relaxed font-mono text-[11px] text-slate-200">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Working Assumptions */}
                <div className="p-4 rounded-lg bg-[#0b1220] border border-amber-900/30 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold uppercase">Working Assumptions (Requires Verification)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                    {analysis.assumptions.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommended Investigation & Containment Steps */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono uppercase font-semibold text-slate-300">
                  Recommended SOC Investigation &amp; Containment Steps
                </h4>
              </div>

              <div className="space-y-2">
                {analysis.recommendedSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-[#0b1220] border border-slate-800 flex items-start space-x-3"
                  >
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 mt-0.5 ${
                      step.priority === 'immediate'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : step.priority === 'high'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {step.priority}
                    </span>

                    <div className="space-y-0.5 text-xs">
                      <div className="font-semibold text-slate-100">
                        {step.action}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        <strong>Rationale:</strong> {step.rationale}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 5: Analyst Feedback & Hindsight Retention Form */}
          <div className="border-t border-slate-800 pt-6">
            <AnalystFeedbackForm
              incident={currentIncident}
              onSubmit={onSubmitFeedback}
            />
          </div>
        </div>
      )}
    </div>
  );
};
