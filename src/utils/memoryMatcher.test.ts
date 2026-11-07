import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMemoryRelevance, formatMemoriesForPrompt, computeIncidentMetrics } from './memoryMatcher';
import { SecurityAlertPayload, RecalledMemory, IncidentRecord } from '../types/sentinel';

test('calculates higher relevance for matching asset group and process', () => {
  const alert: SecurityAlertPayload = {
    alertId: 'SEC-2002',
    title: 'Suspicious PowerShell execution on FIN-SRV-07',
    severity: 'critical',
    timestamp: new Date().toISOString(),
    sourceIp: '10.0.12.55',
    affectedAsset: 'FIN-SRV-07',
    processName: 'powershell.exe',
    parentProcess: 'wmic.exe',
    commandLine: 'powershell.exe -Enc SQBFAFgA'
  };

  const highMatch = calculateMemoryRelevance(
    alert,
    'powershell.exe executed via wmic.exe on FIN server, confirmed credential harvesting',
    'FIN-SRV-04'
  );

  const lowMatch = calculateMemoryRelevance(
    alert,
    'nginx web server spike on DMZ proxy',
    'DMZ-PROXY-01'
  );

  assert.ok(highMatch > 0.7, `Expected highMatch > 0.7, got ${highMatch}`);
  assert.ok(lowMatch < 0.4, `Expected lowMatch < 0.4, got ${lowMatch}`);
  assert.ok(highMatch > lowMatch);
});

test('formats recalled memories into clear prompt text', () => {
  const memories: RecalledMemory[] = [
    {
      id: 'MEM-01',
      title: 'PowerShell Beacon on FIN-SRV-04',
      summary: 'Attacker used WMIC to spawn obfuscated PowerShell',
      asset: 'FIN-SRV-04',
      resolution: 'Host isolated, token revoked, hash blacklisted',
      verdict: 'confirmed_malicious',
      relevanceScore: 0.94,
      source: 'hindsight_cloud',
      timestamp: '2026-11-06T20:00:00Z',
      keyFacts: ['C2 IP was 198.51.100.24', 'Process used base64 encoded flag']
    }
  ];

  const formatted = formatMemoriesForPrompt(memories);
  assert.ok(formatted.includes('FIN-SRV-04'));
  assert.ok(formatted.includes('94%'));
  assert.ok(formatted.includes('Host isolated, token revoked'));
});

test('computes incident metrics accurately', () => {
  const incidents: IncidentRecord[] = [
    {
      id: '1',
      alert: { alertId: '1', title: 'A', severity: 'critical', timestamp: '', sourceIp: '', affectedAsset: 'A' },
      status: 'confirmed_malicious',
      createdAt: '',
      updatedAt: '',
      investigation: {
        incidentId: '1',
        analyzedAt: '',
        threatVerdict: '',
        severity: 'critical',
        confidence: 90,
        summary: '',
        suspiciousActivityExplanation: [],
        mitreTechniques: [],
        evidence: [],
        assumptions: [],
        recommendedSteps: [],
        memoryInformed: true,
        recalledMemoriesCount: 1
      }
    },
    {
      id: '2',
      alert: { alertId: '2', title: 'B', severity: 'low', timestamp: '', sourceIp: '', affectedAsset: 'B' },
      status: 'new',
      createdAt: '',
      updatedAt: ''
    }
  ];

  const metrics = computeIncidentMetrics(incidents);
  assert.equal(metrics.total, 2);
  assert.equal(metrics.critical, 1);
  assert.equal(metrics.resolved, 1);
  assert.equal(metrics.memoryInformed, 1);
  assert.equal(metrics.memoryInfluenceRate, 50);
});
