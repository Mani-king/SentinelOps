import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Search, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  Terminal, 
  Clock, 
  Layers, 
  ArrowRight,
  Info,
  Send,
  RefreshCw,
  Server,
  FileCode2,
  Activity
} from 'lucide-react';
import { RecalledMemory, SystemStatus } from '../types/sentinel';

interface OrganizationalMemoryProps {
  status: SystemStatus | null;
  onOpenCredentials: () => void;
}

export const OrganizationalMemory: React.FC<OrganizationalMemoryProps> = ({
  status,
  onOpenCredentials
}) => {
  const [memories, setMemories] = useState<RecalledMemory[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);
  
  // Recall Test
  const [recallQuery, setRecallQuery] = useState('PowerShell execution on FIN server WMIC');
  const [recallResults, setRecallResults] = useState<any[] | null>(null);
  const [isRecalling, setIsRecalling] = useState(false);

  // Reflect Test
  const [reflectQuery, setReflectQuery] = useState('What recurring attack techniques and service account compromises have been observed on the financial subnet?');
  const [reflectResult, setReflectResult] = useState<any | null>(null);
  const [isReflecting, setIsReflecting] = useState(false);

  // Operations Logs
  const [operationsLogs, setOperationsLogs] = useState<any[]>([]);

  const isConnected = status?.hindsight?.status === 'connected';

  const fetchMemories = async () => {
    setIsLoadingMemories(true);
    try {
      const res = await fetch('/api/hindsight/memories');
      const data = await res.json();
      setMemories(data.memories || []);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setIsLoadingMemories(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/hindsight/logs');
      const data = await res.json();
      setOperationsLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  useEffect(() => {
    fetchMemories();
    fetchLogs();
  }, []);

  const handleTestRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recallQuery.trim()) return;
    setIsRecalling(true);
    setRecallResults(null);

    try {
      const res = await fetch('/api/hindsight/recall-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: recallQuery })
      });
      const data = await res.json();
      setRecallResults(data.memories || []);
      fetchLogs();
    } catch (err) {
      console.error('Recall error:', err);
    } finally {
      setIsRecalling(false);
    }
  };

  const handleTestReflect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectQuery.trim()) return;
    setIsReflecting(true);
    setReflectResult(null);

    try {
      const res = await fetch('/api/hindsight/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: reflectQuery })
      });
      const data = await res.json();
      setReflectResult(data.result || data.message || data);
      fetchLogs();
    } catch (err) {
      console.error('Reflect error:', err);
    } finally {
      setIsReflecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Hindsight Cloud Architecture */}
      <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">
                  Hindsight Cloud Organizational Memory
                </h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isConnected
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {isConnected ? 'LIVE CONNECTED' : 'CREDENTIALS REQUIRED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Biomimetic semantic memory architecture for SOC incident response (Retain, Recall, Reflect).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-500">Active Bank:</span>
            <span className="px-2 py-1 rounded bg-[#090e1a] text-cyan-300 border border-slate-800">
              {status?.hindsight?.bankId || 'sentinelops-soc-prod'}
            </span>
            <button
              onClick={onOpenCredentials}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
            >
              Config
            </button>
          </div>
        </div>

        {/* Status Callout */}
        <div className="p-3.5 rounded-lg bg-[#080d19] border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>
              <strong>Official Hindsight API Integration:</strong> Every resolved incident is vectorized and retained in the memory bank via <code className="text-cyan-300">client.retain()</code>. When new alerts arrive, multi-strategy parallel retrieval via <code className="text-cyan-300">client.recall()</code> extracts facts and previous analyst findings to guide Gemini.
            </p>
            {!isConnected && (
              <p className="text-amber-400 font-mono text-[11px]">
                Note: HINDSIGHT_API_KEY is not yet set in environment. Local persistent store provides deterministic recall for the demo scenario while live cloud operations wait for API token.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Testing Console: Recall & Reflect */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Test Memory Recall */}
        <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Test Memory Recall (Recall API)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">client.recall()</span>
          </div>

          <p className="text-xs text-slate-400">
            Query the institutional memory bank for historical incidents matching specific IOCs, command patterns, or hostnames.
          </p>

          <form onSubmit={handleTestRecall} className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={recallQuery}
                onChange={(e) => setRecallQuery(e.target.value)}
                placeholder="e.g. PowerShell execution on FIN-SRV..."
                className="flex-1 bg-[#090e1a] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isRecalling}
                className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                <Search className={`w-3.5 h-3.5 ${isRecalling ? 'animate-spin' : ''}`} />
                <span>{isRecalling ? 'Recalling...' : 'Recall'}</span>
              </button>
            </div>
          </form>

          {/* Recall Output */}
          {recallResults !== null && (
            <div className="mt-3 p-3.5 rounded-lg bg-[#080d19] border border-slate-800 space-y-2 max-h-60 overflow-y-auto">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>RECALL RESULTS ({recallResults.length} FOUND)</span>
              </div>
              {recallResults.length === 0 ? (
                <p className="text-xs text-slate-500">No matching memories returned for this query.</p>
              ) : (
                recallResults.map((res, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-[#0d1527] border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-cyan-300 font-bold">{res.title}</span>
                      <span className="text-slate-400">Score: {((res.relevanceScore || 0.88) * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{res.summary}</p>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      Resolution: {res.resolution}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Box 2: Test Agentic Reflect */}
        <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Test Agentic Reasoning (Reflect API)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">client.reflect()</span>
          </div>

          <p className="text-xs text-slate-400">
            Autonomous agentic synthesis across the entire memory bank to uncover systemic campaign patterns and blindspots.
          </p>

          <form onSubmit={handleTestReflect} className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={reflectQuery}
                onChange={(e) => setReflectQuery(e.target.value)}
                placeholder="Ask high-level organizational questions..."
                className="flex-1 bg-[#090e1a] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={isReflecting}
                className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isReflecting ? 'animate-spin' : ''}`} />
                <span>{isReflecting ? 'Reflecting...' : 'Reflect'}</span>
              </button>
            </div>
          </form>

          {/* Reflect Output */}
          {reflectResult !== null && (
            <div className="mt-3 p-3.5 rounded-lg bg-[#080d19] border border-purple-900/40 space-y-2 max-h-60 overflow-y-auto">
              <div className="text-[11px] font-mono text-purple-400 font-bold">
                HINDSIGHT REFLECT SYNTHESIS:
              </div>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {typeof reflectResult === 'string' ? reflectResult : JSON.stringify(reflectResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Retained Memory Records List */}
      <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Retained Institutional Memory Records ({memories.length})
            </h3>
          </div>
          <button
            onClick={fetchMemories}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="p-4 rounded-xl bg-[#090e1a] border border-slate-800/90 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">
                  {mem.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {mem.verdict.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                <span>Asset: <strong className="text-cyan-300">{mem.asset}</strong></span>
                <span>Source: {mem.source}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {mem.summary}
              </p>

              <div className="p-2.5 rounded bg-[#0d1629] border border-slate-800/80 text-[11px] text-slate-300">
                <strong className="text-emerald-400">Playbook Resolution: </strong>
                {mem.resolution}
              </div>

              {mem.keyFacts && (
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                  {mem.keyFacts.join(' • ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Hindsight Operations Audit Log */}
      <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Hindsight API Operations Log
            </h3>
          </div>
          <button
            onClick={fetchLogs}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reload Logs</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Operation</th>
                <th className="py-2 px-3">Bank ID</th>
                <th className="py-2 px-3">Payload / Query</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {operationsLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No operations logged yet. Retain or recall an incident to view audit trail.
                  </td>
                </tr>
              ) : (
                operationsLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 uppercase font-bold text-cyan-400">
                      {log.operation}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {log.bankId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 truncate max-w-xs">
                      {log.queryOrContent}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        log.success
                          ? 'bg-emerald-950 text-emerald-400'
                          : log.status === 'credentials_required'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-rose-950 text-rose-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
