export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type IncidentStatus = 
  | 'new'
  | 'investigating'
  | 'confirmed_malicious'
  | 'false_positive'
  | 'benign_policy'
  | 'resolved';

export interface SecurityAlertPayload {
  alertId: string;
  title: string;
  severity: SeverityLevel;
  timestamp: string;
  sourceIp: string;
  affectedAsset: string;
  destinationIp?: string;
  userAccount?: string;
  processName?: string;
  commandLine?: string;
  parentProcess?: string;
  fileHash?: string;
  rawLogs?: string;
  detectionSource?: string;
  tags?: string[];
}

export interface MitreAttackTechnique {
  id: string; // e.g. T1059.001
  tactic: string; // e.g. Execution
  name: string; // e.g. PowerShell
  description?: string;
}

export interface RecalledMemory {
  id: string;
  title: string;
  summary: string;
  asset: string;
  resolution: string;
  verdict: IncidentStatus;
  relevanceScore: number;
  source: 'hindsight_cloud' | 'local_store';
  timestamp: string;
  keyFacts?: string[];
}

export interface InvestigationAnalysis {
  incidentId: string;
  analyzedAt: string;
  threatVerdict: string;
  severity: SeverityLevel;
  confidence: number; // 0 - 100
  summary: string;
  suspiciousActivityExplanation: string[];
  mitreTechniques: MitreAttackTechnique[];
  evidence: string[];
  assumptions: string[];
  recommendedSteps: {
    priority: 'immediate' | 'high' | 'medium';
    action: string;
    rationale: string;
  }[];
  memoryInformed: boolean;
  recalledMemoriesCount: number;
  memoryInfluenceSummary?: string;
}

export interface AnalystFeedback {
  verdict: IncidentStatus;
  analystName: string;
  notes: string;
  rootCause: string;
  remediationTaken: string;
  retainedInHindsight: boolean;
  hindsightResponse?: {
    success: boolean;
    operationId?: string;
    bankId?: string;
    message?: string;
  };
  submittedAt: string;
}

export interface IncidentRecord {
  id: string;
  alert: SecurityAlertPayload;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  investigation?: InvestigationAnalysis;
  feedback?: AnalystFeedback;
  recalledMemories?: RecalledMemory[];
}

export interface SystemStatus {
  gemini: {
    configured: boolean;
    model: string;
  };
  hindsight: {
    configured: boolean;
    baseUrl: string;
    bankId: string;
    status: 'connected' | 'credentials_required' | 'error';
    message?: string;
  };
  stats: {
    totalIncidents: number;
    criticalAlerts: number;
    resolvedIncidents: number;
    retainedMemoriesCount: number;
    recallQueriesCount: number;
    memoryInfluenceRate?: number;
  };
}
