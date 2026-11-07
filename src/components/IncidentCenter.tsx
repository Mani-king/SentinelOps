import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Sparkles, 
  Terminal, 
  Server, 
  Eye, 
  PlusCircle, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Code2,
  Copy,
  Check
} from 'lucide-react';
import { IncidentRecord, SeverityLevel, IncidentStatus } from '../types/sentinel';

interface IncidentCenterProps {
  incidents: IncidentRecord[];
  onSelectIncident: (id: string, tab?: string) => void;
  onOpenNewAlert: () => void;
}

export const IncidentCenter: React.FC<IncidentCenterProps> = ({
  incidents,
  onSelectIncident,
  onOpenNewAlert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedForDetails, setSelectedForDetails] = useState<IncidentRecord | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Severity filter
      if (severityFilter !== 'all' && inc.alert.severity !== severityFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && inc.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = inc.alert.title.toLowerCase().includes(q);
        const matchesAsset = inc.alert.affectedAsset.toLowerCase().includes(q);
        const matchesId = inc.id.toLowerCase().includes(q) || inc.alert.alertId.toLowerCase().includes(q);
        const matchesIp = inc.alert.sourceIp.includes(q) || (inc.alert.destinationIp && inc.alert.destinationIp.includes(q));
        const matchesProcess = inc.alert.processName?.toLowerCase().includes(q);

        return matchesTitle || matchesAsset || matchesId || matchesIp || matchesProcess;
      }
      return true;
    });
  }, [incidents, searchQuery, severityFilter, statusFilter]);

  const handleCopyRaw = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'confirmed_malicious':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-rose-950/80 text-rose-300 border border-rose-800/60">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>Confirmed Malicious</span>
          </span>
        );
      case 'false_positive':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
            <CheckCircle2 className="w-3 h-3 text-slate-400" />
            <span>False Positive</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Resolved</span>
          </span>
        );
      case 'investigating':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Investigating</span>
          </span>
        );
      case 'new':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>New Alert</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters & Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by asset, IP, alert ID, or process..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#090e1a] border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns & Actions */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Severity Filter */}
          <div className="flex items-center space-x-1 bg-[#090e1a] border border-slate-700 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-[#090e1a] border border-slate-700 rounded-lg px-2.5 py-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="investigating">Investigating</option>
              <option value="confirmed_malicious">Confirmed Malicious</option>
              <option value="false_positive">False Positive</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Submit Alert Button */}
          <button
            onClick={onOpenNewAlert}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit JSON Alert</span>
          </button>
        </div>
      </div>

      {/* Security Alerts Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0b1220] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Incident / Alert</th>
                <th className="py-3 px-4">Affected Asset</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No security alerts found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => {
                  const sev = incident.alert.severity;
                  const hasMemory = incident.investigation?.memoryInformed;

                  return (
                    <tr
                      key={incident.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                          sev === 'critical'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                            : sev === 'high'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            sev === 'critical' ? 'bg-rose-500 animate-pulse' : sev === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <span>{sev}</span>
                        </span>
                      </td>

                      {/* Alert Title & Tags */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[11px] text-cyan-400">
                              {incident.id}
                            </span>
                            {hasMemory && (
                              <span className="inline-flex items-center space-x-0.5 px-1 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                                <BrainCircuit className="w-2.5 h-2.5" />
                                <span>Memory Recalled</span>
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                            {incident.alert.title}
                          </div>
                          {incident.alert.tags && incident.alert.tags.length > 0 && (
                            <div className="flex items-center space-x-1 flex-wrap gap-y-1 pt-0.5">
                              {incident.alert.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Affected Asset */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Server className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono font-medium text-slate-200">
                            {incident.alert.affectedAsset}
                          </span>
                        </div>
                        {incident.alert.processName && (
                          <div className="text-[11px] text-slate-400 font-mono truncate max-w-[140px] mt-0.5">
                            {incident.alert.processName}
                          </div>
                        )}
                      </td>

                      {/* Source IP */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300">
                        {incident.alert.sourceIp}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        <div>{new Date(incident.createdAt).toLocaleDateString()}</div>
                        <div>{new Date(incident.createdAt).toLocaleTimeString()}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(incident.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => setSelectedForDetails(incident)}
                          className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
                          title="View Raw Alert JSON & Telemetry"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          <span>Details</span>
                        </button>

                        <button
                          onClick={() => onSelectIncident(incident.id, 'investigation')}
                          className="px-2.5 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium shadow-sm transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                          <span>Investigate AI</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Details & Raw Telemetry Drawer/Modal */}
      {selectedForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0b1220]">
              <div className="flex items-center space-x-3">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedForDetails.alert.title}
                  </h3>
                  <div className="text-xs font-mono text-slate-400">
                    ID: {selectedForDetails.id} | Asset: {selectedForDetails.alert.affectedAsset}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedForDetails(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#090e1a] p-3.5 rounded-lg border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">SEVERITY</span>
                  <span className="text-white font-bold uppercase">{selectedForDetails.alert.severity}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SOURCE IP</span>
                  <span className="text-white">{selectedForDetails.alert.sourceIp}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">DESTINATION IP</span>
                  <span className="text-white">{selectedForDetails.alert.destinationIp || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">USER ACCOUNT</span>
                  <span className="text-white">{selectedForDetails.alert.userAccount || 'SYSTEM'}</span>
                </div>
              </div>

              {/* Process & Command Line */}
              {selectedForDetails.alert.commandLine && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-white">Command Line Execution</span>
                    <button
                      onClick={() => handleCopyRaw(selectedForDetails.alert.commandLine || '')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                    >
                      {copiedRaw ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRaw ? 'Copied' : 'Copy Command'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-[#070b14] border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap break-all">
                    {selectedForDetails.alert.commandLine}
                  </pre>
                </div>
              )}

              {/* Raw JSON Inspector */}
              <div className="space-y-1.5">
                <span className="font-semibold text-white">Full Alert Telemetry Payload (JSON)</span>
                <pre className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-60">
                  {JSON.stringify(selectedForDetails.alert, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-[#0b1220] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Detection Source: {selectedForDetails.alert.detectionSource || 'EDR Agent'}
              </span>

              <button
                onClick={() => {
                  const id = selectedForDetails.id;
                  setSelectedForDetails(null);
                  onSelectIncident(id, 'investigation');
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition-colors"
              >
                Open in AI Investigation Console &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
