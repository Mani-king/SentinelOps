import { SecurityAlertPayload, SeverityLevel } from '../types/sentinel';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  alert?: SecurityAlertPayload;
}

const VALID_SEVERITIES: SeverityLevel[] = ['critical', 'high', 'medium', 'low', 'info'];

/**
 * Validates a security alert payload JSON from external sources or SOC analysts.
 */
export function validateSecurityAlert(raw: unknown): ValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return { valid: false, errors: ['Alert payload must be a non-null JSON object'] };
  }

  const obj = raw as Record<string, unknown>;

  if (!obj.title || typeof obj.title !== 'string' || obj.title.trim().length === 0) {
    errors.push('Alert "title" is required and must be a non-empty string');
  }

  if (!obj.affectedAsset || typeof obj.affectedAsset !== 'string' || obj.affectedAsset.trim().length === 0) {
    errors.push('Alert "affectedAsset" is required (e.g. host name or asset ID)');
  }

  const severity = String(obj.severity || '').toLowerCase() as SeverityLevel;
  if (!VALID_SEVERITIES.includes(severity)) {
    errors.push(`Alert "severity" must be one of: ${VALID_SEVERITIES.join(', ')}`);
  }

  const alertId = typeof obj.alertId === 'string' && obj.alertId.trim().length > 0 
    ? obj.alertId.trim() 
    : `SEC-${Date.now().toString().slice(-6)}`;

  const sourceIp = typeof obj.sourceIp === 'string' && obj.sourceIp.trim().length > 0
    ? obj.sourceIp.trim()
    : '127.0.0.1';

  const timestamp = typeof obj.timestamp === 'string' && !isNaN(Date.parse(obj.timestamp))
    ? new Date(obj.timestamp).toISOString()
    : new Date().toISOString();

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const sanitized: SecurityAlertPayload = {
    alertId,
    title: (obj.title as string).trim(),
    severity,
    timestamp,
    sourceIp,
    affectedAsset: (obj.affectedAsset as string).trim(),
    destinationIp: typeof obj.destinationIp === 'string' ? obj.destinationIp.trim() : undefined,
    userAccount: typeof obj.userAccount === 'string' ? obj.userAccount.trim() : undefined,
    processName: typeof obj.processName === 'string' ? obj.processName.trim() : undefined,
    commandLine: typeof obj.commandLine === 'string' ? obj.commandLine.trim() : undefined,
    parentProcess: typeof obj.parentProcess === 'string' ? obj.parentProcess.trim() : undefined,
    fileHash: typeof obj.fileHash === 'string' ? obj.fileHash.trim() : undefined,
    rawLogs: typeof obj.rawLogs === 'string' ? obj.rawLogs.trim() : undefined,
    detectionSource: typeof obj.detectionSource === 'string' ? obj.detectionSource.trim() : 'EDR Sentinel Agent',
    tags: Array.isArray(obj.tags) ? obj.tags.filter(t => typeof t === 'string') : []
  };

  return { valid: true, errors: [], alert: sanitized };
}

/**
 * Builds an optimal Hindsight recall query based on alert attributes.
 */
export function buildMemoryRecallQuery(alert: SecurityAlertPayload): string {
  const parts: string[] = [];
  
  if (alert.processName) {
    parts.push(`process ${alert.processName}`);
  }
  if (alert.title) {
    parts.push(alert.title);
  }
  if (alert.commandLine) {
    const snippet = alert.commandLine.slice(0, 80);
    parts.push(`command: ${snippet}`);
  }
  if (alert.parentProcess) {
    parts.push(`parent: ${alert.parentProcess}`);
  }
  if (alert.affectedAsset) {
    const assetPrefix = alert.affectedAsset.split('-')[0];
    if (assetPrefix) {
      parts.push(`asset family: ${assetPrefix}`);
    }
  }

  return parts.join(' | ') || `Incident investigation for ${alert.title}`;
}
