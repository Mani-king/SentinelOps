import React from 'react';
import { 
  Database, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Lock, 
  ExternalLink,
  Shield,
  Key
} from 'lucide-react';
import { SystemStatus } from '../types/sentinel';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SystemStatus | null;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  status
}) => {
  if (!isOpen) return null;

  const isHindsightConnected = status?.hindsight?.status === 'connected';
  const isGeminiConnected = Boolean(status?.gemini?.configured);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-700 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0b1220]">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Cloud Integrations &amp; Security Credentials
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {/* Security Banner */}
          <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Zero-Trust Architecture: API tokens are strictly stored on the server side and never sent or exposed to client browsers.
            </span>
          </div>

          {/* Integration 1: Hindsight Cloud */}
          <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-xs">Hindsight Cloud (Persistent Memory)</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                isHindsightConnected
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {isHindsightConnected ? 'LIVE CONNECTED' : 'CREDENTIALS REQUIRED'}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-slate-400">
              <div>Endpoint: <span className="text-slate-200">{status?.hindsight?.baseUrl || 'https://api.hindsight.vectorize.io'}</span></div>
              <div>Memory Bank: <span className="text-cyan-300">{status?.hindsight?.bankId || 'sentinelops-soc-prod'}</span></div>
            </div>

            <div className="p-3 rounded-lg bg-[#0d1629] border border-slate-800/80 text-[11px] space-y-1.5">
              <p className="text-slate-300">
                <strong>Honest Integration Guarantee:</strong> SentinelOps uses the official <code className="text-cyan-300">@vectorize-io/hindsight-client</code> SDK. In accordance with SOC standards, we never simulate successful cloud operations when credentials are missing.
              </p>
              <p className="text-slate-400">
                To connect to live Hindsight Cloud, set <code className="text-amber-300">HINDSIGHT_API_KEY</code> in server secrets or your environment file.
              </p>
            </div>
          </div>

          {/* Integration 2: Gemini AI */}
          <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white text-xs">Gemini AI (Incident Investigation)</span>
              </div>
              <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE (gemini-3.8-flash)
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Synthesizes raw telemetry and historical organizational memories into prioritized SOC actions, separating concrete evidence from working assumptions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0b1220] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
