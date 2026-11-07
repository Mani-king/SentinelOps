import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSecurityAlert, buildMemoryRecallQuery } from './alertValidator';

test('validates valid security alert', () => {
  const result = validateSecurityAlert({
    title: 'Suspicious PowerShell execution on FIN-SRV-04',
    severity: 'critical',
    affectedAsset: 'FIN-SRV-04',
    sourceIp: '10.0.12.44',
    processName: 'powershell.exe',
    commandLine: 'powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgA',
    parentProcess: 'wmic.exe'
  });

  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.ok(result.alert);
  assert.equal(result.alert.severity, 'critical');
  assert.equal(result.alert.affectedAsset, 'FIN-SRV-04');
});

test('rejects alert missing mandatory fields', () => {
  const result = validateSecurityAlert({
    sourceIp: '10.0.12.44'
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('title')));
  assert.ok(result.errors.some(e => e.includes('affectedAsset')));
  assert.ok(result.errors.some(e => e.includes('severity')));
});

test('rejects invalid severity level', () => {
  const result = validateSecurityAlert({
    title: 'Test alert',
    affectedAsset: 'SRV-01',
    severity: 'super-fatal'
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('severity')));
});

test('builds informative memory recall query', () => {
  const query = buildMemoryRecallQuery({
    alertId: 'SEC-1001',
    title: 'Suspicious PowerShell Execution',
    severity: 'critical',
    timestamp: new Date().toISOString(),
    sourceIp: '10.0.1.1',
    affectedAsset: 'FIN-SRV-07',
    processName: 'powershell.exe',
    commandLine: 'powershell.exe -Enc SQBFAFgA',
    parentProcess: 'wmic.exe'
  });

  assert.ok(query.includes('powershell.exe'));
  assert.ok(query.includes('Suspicious PowerShell Execution'));
  assert.ok(query.includes('FIN'));
});
