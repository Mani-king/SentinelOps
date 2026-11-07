import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BrainCircuit, 
  Save, 
  User, 
  FileText, 
  Wrench, 
  Database,
  ArrowRight
} from 'lucide-react';
import { IncidentRecord, IncidentStatus, AnalystFeedback } from '../types/sentinel';

interface AnalystFeedbackFormProps {
  incident: IncidentRecord;
  onSubmit: (id: string, feedback: Partial<AnalystFeedback>) => Promise<void>;
}

export const AnalystFeedbackForm: React.FC<AnalystFeedbackFormProps> = ({
  incident,
  onSubmit
}) => {
  const existingFeedback = incident.feedback;
  const [isEditing, setIsEditing] = useState(!existingFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [verdict, setVerdict] = useState<IncidentStatus>(existingFeedback?.verdict || 'confirmed_malicious');
  const [analystName, setAnalystName] = useState(existingFeedback?.analystName || 'Alex Mercer (Lead SOC Analyst)');
  const [rootCause, setRootCause] = useState(
    existingFeedback?.rootCause || 
    (incident.alert.affectedAsset === 'FIN-SRV-07' 
      ? 'Lateral movement from previously compromised accounting credentials (svc-payroll) invoking remote WMIC execution.' 
      : 'Suspicious execution requiring containment and forensic triage.')
  );
  const [remediationTaken, setRemediationTaken] = useState(
    existingFeedback?.remediationTaken || 
    (incident.alert.affectedAsset === 'FIN-SRV-07'
      ? '1. Host FIN-SRV-07 network isolated. 2. Invalidate active Kerberos tickets. 3. Re-verify perimeter block for 198.51.100.24.'
      : '1. Host isolated. 2. Volatile memory acquired. 3. Service account credentials rotated.')
  );
  const [notes, setNotes] = useState(
    existingFeedback?.notes || 
    'Investigation completed. Confirmed malicious execution pattern matching institutional playbook.'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(incident.id, {
        verdict,
        analystName,
        rootCause,
        remediationTaken,
        notes
      });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-[#0f172a] border border-cyan-900/40 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Analyst Feedback &amp; Institutional Memory Retention
            </h3>
            <p className="text-xs text-slate-400">
              Retain your investigation outcome to train SentinelOps&apos; organizational memory in Hindsight Cloud.
            </p>
          </div>
        </div>

        {existingFeedback && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
          >
            Edit Feedback
          </button>
        )}
      </div>

      {existingFeedback && !isEditing ? (
        /* Read-only Feedback View */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#080d19] border border-slate-800">
            <div className="flex items-center space-x-3">
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                existingFeedback.verdict === 'confirmed_malicious'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : existingFeedback.verdict === 'false_positive'
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-emerald-950 text-emerald-300'
              }`}>
                {existingFeedback.verdict.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">
                Analyst: <strong className="text-slate-200">{existingFeedback.analystName}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
              <BrainCircuit className="w-4 h-4" />
              <span>RETAINED IN HINDSIGHT</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#0b1220] border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-300 block">Root Cause Determination</span>
              <p className="text-slate-400 leading-relaxed">{existingFeedback.rootCause}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0b1220] border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-300 block">Remediation &amp; Containment Taken</span>
              <p className="text-slate-400 leading-relaxed">{existingFeedback.remediationTaken}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0b1220] border border-slate-800 text-xs space-y-1">
            <span className="font-semibold text-slate-300 block">Investigation Notes</span>
            <p className="text-slate-400 leading-relaxed">{existingFeedback.notes}</p>
          </div>
        </div>
      ) : (
        /* Edit Feedback Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Verdict Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase font-mono block">
              1. Incident Final Verdict
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'confirmed_malicious', label: 'Confirmed Malicious', color: 'rose' },
                { id: 'false_positive', label: 'False Positive', color: 'slate' },
                { id: 'benign_policy', label: 'Benign Policy Violation', color: 'amber' },
                { id: 'resolved', label: 'Resolved / Mitigated', color: 'emerald' },
              ].map((item) => {
                const isSelected = verdict === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setVerdict(item.id as IncidentStatus)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                      isSelected
                        ? item.color === 'rose'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500 shadow-md shadow-rose-950/50'
                          : item.color === 'emerald'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-950/50'
                          : item.color === 'amber'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-md shadow-amber-950/50'
                          : 'bg-slate-800 text-white border-slate-400'
                        : 'bg-[#080d19] text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analyst Name & Root Cause */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Analyst Name / Tier</span>
              </label>
              <input
                type="text"
                required
                value={analystName}
                onChange={(e) => setAnalystName(e.target.value)}
                className="w-full bg-[#080d19] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Root Cause Determination</span>
              </label>
              <input
                type="text"
                required
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                className="w-full bg-[#080d19] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Remediation Steps Taken */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>Remediation &amp; Containment Actions Taken</span>
            </label>
            <textarea
              rows={2}
              required
              value={remediationTaken}
              onChange={(e) => setRemediationTaken(e.target.value)}
              className="w-full bg-[#080d19] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Detailed Investigation Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Investigation Notes &amp; Findings</span>
            </label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#080d19] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Hindsight Retention Preview */}
          <div className="p-3.5 rounded-lg bg-[#070d1a] border border-cyan-900/50 space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Database className="w-3.5 h-3.5" />
              <span>HINDSIGHT CLOUD PERSISTENCE PREVIEW:</span>
            </div>
            <p className="text-slate-400">
              Payload: &quot;Incident {incident.alert.title} on asset {incident.alert.affectedAsset}. Verdict: {verdict}. Root Cause: {rootCause}. Remediation: {remediationTaken}&quot;
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            {existingFeedback && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Retaining in Hindsight...' : 'Submit Feedback & Retain in Memory'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
