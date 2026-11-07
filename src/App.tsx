import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Overview } from './components/Overview';
import { IncidentCenter } from './components/IncidentCenter';
import { AiInvestigation } from './components/AiInvestigation';
import { OrganizationalMemory } from './components/OrganizationalMemory';
import { LearningAnalytics } from './components/LearningAnalytics';
import { NewAlertModal } from './components/NewAlertModal';
import { CredentialsModal } from './components/CredentialsModal';
import { IncidentRecord, SystemStatus, SecurityAlertPayload } from './types/sentinel';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [activeIncidentId, setActiveIncidentId] = useState<string>('INC-2026-0895');
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Modals
  const [isNewAlertOpen, setIsNewAlertOpen] = useState(false);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    }
  }, []);

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
        if (data.incidents?.length > 0 && !activeIncidentId) {
          setActiveIncidentId(data.incidents[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeIncidentId]);

  useEffect(() => {
    fetchStatus();
    fetchIncidents();
  }, [fetchStatus, fetchIncidents]);

  const handleSelectIncident = (id: string, tab?: string) => {
    setActiveIncidentId(id);
    if (tab) {
      setActiveTab(tab);
    }
  };

  const handleRunInvestigation = async (id: string) => {
    setIsInvestigating(true);
    try {
      const res = await fetch(`/api/incidents/${id}/investigate`, {
        method: 'POST'
      });
      if (!res.ok) {
        throw new Error(`Investigation failed with status ${res.status}`);
      }
      const data = await res.json();
      
      // Update local incidents state
      setIncidents((prev) => 
        prev.map((i) => (i.id === id ? data.incident : i))
      );

      fetchStatus();

      if (data.recalledMemories && data.recalledMemories.length > 0) {
        showToast(
          `Investigation completed! Recalled historical memory from ${data.recalledMemories[0].title}`,
          'success'
        );
      } else {
        showToast('Investigation analysis completed.', 'info');
      }
    } catch (err: any) {
      console.error('Error running investigation:', err);
      showToast(`Investigation error: ${err.message}`, 'error');
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleSubmitFeedback = async (id: string, feedback: any) => {
    try {
      const res = await fetch(`/api/incidents/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });
      if (!res.ok) {
        throw new Error('Failed to record feedback');
      }
      const data = await res.json();

      setIncidents((prev) => 
        prev.map((i) => (i.id === id ? data.incident : i))
      );

      fetchStatus();

      if (data.hindsightRetainResult?.success) {
        showToast('Incident outcome successfully retained in Hindsight Cloud bank!', 'success');
      } else {
        showToast('Incident outcome recorded locally (Hindsight Cloud credentials required).', 'info');
      }
    } catch (err: any) {
      console.error('Feedback submission error:', err);
      showToast(`Submission error: ${err.message}`, 'error');
      throw err;
    }
  };

  const handleSubmitNewAlert = async (alert: SecurityAlertPayload) => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
      if (!res.ok) {
        throw new Error('Failed to ingest alert');
      }
      const data = await res.json();
      const newInc = data.incident;

      setIncidents((prev) => [newInc, ...prev]);
      setActiveIncidentId(newInc.id);
      setActiveTab('investigation');
      fetchStatus();

      showToast(`Ingested alert ${newInc.id}. Ready for investigation.`, 'success');
    } catch (err: any) {
      showToast(`Ingest error: ${err.message}`, 'error');
      throw err;
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
        setActiveIncidentId('INC-2026-0895');
        fetchStatus();
        showToast('Demo scenario reset to initial state (FIN-SRV-04 & FIN-SRV-07 ready).', 'success');
      }
    } catch (err: any) {
      showToast(`Reset error: ${err.message}`, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-lg shadow-2xl border text-xs font-medium animate-in fade-in slide-in-from-bottom-5 bg-[#0f172a] text-white border-slate-700">
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={status}
        onOpenNewAlert={() => setIsNewAlertOpen(true)}
        onResetDemo={handleResetDemo}
        onOpenCredentials={() => setIsCredentialsOpen(true)}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Initializing SentinelOps SOC Engine...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <Overview
                incidents={incidents}
                status={status}
                onSelectIncident={handleSelectIncident}
                onOpenNewAlert={() => setIsNewAlertOpen(true)}
                onOpenCredentials={() => setIsCredentialsOpen(true)}
              />
            )}

            {activeTab === 'incidents' && (
              <IncidentCenter
                incidents={incidents}
                onSelectIncident={handleSelectIncident}
                onOpenNewAlert={() => setIsNewAlertOpen(true)}
              />
            )}

            {activeTab === 'investigation' && (
              <AiInvestigation
                incidents={incidents}
                activeIncidentId={activeIncidentId}
                onSelectIncident={(id) => setActiveIncidentId(id)}
                onRunInvestigation={handleRunInvestigation}
                onSubmitFeedback={handleSubmitFeedback}
                isInvestigating={isInvestigating}
                onOpenCredentials={() => setIsCredentialsOpen(true)}
              />
            )}

            {activeTab === 'memory' && (
              <OrganizationalMemory
                status={status}
                onOpenCredentials={() => setIsCredentialsOpen(true)}
              />
            )}

            {activeTab === 'analytics' && (
              <LearningAnalytics
                incidents={incidents}
                status={status}
                onSelectIncident={handleSelectIncident}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <NewAlertModal
        isOpen={isNewAlertOpen}
        onClose={() => setIsNewAlertOpen(false)}
        onSubmit={handleSubmitNewAlert}
      />

      <CredentialsModal
        isOpen={isCredentialsOpen}
        onClose={() => setIsCredentialsOpen(false)}
        status={status}
      />
    </div>
  );
}
