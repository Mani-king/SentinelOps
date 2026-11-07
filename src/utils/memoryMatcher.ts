import { SecurityAlertPayload, RecalledMemory, IncidentRecord } from '../types/sentinel';

/**
 * Calculates a match score (0.0 - 1.0) between an alert and a historical incident memory.
 */
export function calculateMemoryRelevance(alert: SecurityAlertPayload, memoryText: string, memoryAsset?: string): number {
  let score = 0.2; // Base prior

  const normalizedMem = memoryText.toLowerCase();
  
  if (alert.processName && normalizedMem.includes(alert.processName.toLowerCase())) {
    score += 0.3;
  }

  if (alert.parentProcess && normalizedMem.includes(alert.parentProcess.toLowerCase())) {
    score += 0.15;
  }

  if (alert.affectedAsset && memoryAsset) {
    if (alert.affectedAsset.toLowerCase() === memoryAsset.toLowerCase()) {
      score += 0.25;
    } else {
      // Check prefix/subnet (e.g. FIN-SRV)
      const prefixAlert = alert.affectedAsset.split('-')[0].toLowerCase();
      const prefixMem = memoryAsset.split('-')[0].toLowerCase();
      if (prefixAlert === prefixMem && prefixAlert.length > 1) {
        score += 0.2;
      }
    }
  }

  // Check command line tokens
  if (alert.commandLine) {
    const tokens = alert.commandLine.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    for (const token of tokens) {
      if (normalizedMem.includes(token)) {
        score += 0.05;
      }
    }
  }

  return Math.min(0.99, Math.round(score * 100) / 100);
}

/**
 * Formats recalled memories for injection into Gemini investigation prompts.
 */
export function formatMemoriesForPrompt(memories: RecalledMemory[]): string {
  if (!memories || memories.length === 0) {
    return 'No relevant historical incidents found in organizational memory.';
  }

  return memories.map((m, idx) => {
    return `[Historical Memory Record #${idx + 1}]
- Incident: ${m.title}
- Target Asset: ${m.asset}
- Historical Verdict: ${m.verdict}
- Similarity / Relevance Score: ${(m.relevanceScore * 100).toFixed(0)}%
- Resolution Details: ${m.resolution}
- Summary & Observations: ${m.summary}
${m.keyFacts && m.keyFacts.length > 0 ? `- Established Facts: ${m.keyFacts.join('; ')}` : ''}
`;
  }).join('\n\n');
}

/**
 * Calculates high-level metrics from a list of incidents.
 */
export function computeIncidentMetrics(incidents: IncidentRecord[]) {
  const total = incidents.length;
  const critical = incidents.filter(i => i.alert.severity === 'critical').length;
  const resolved = incidents.filter(i => i.status === 'resolved' || i.status === 'confirmed_malicious' || i.status === 'false_positive').length;
  const memoryInformed = incidents.filter(i => i.investigation?.memoryInformed).length;
  const memoryInfluenceRate = total > 0 ? Math.round((memoryInformed / total) * 100) : 0;

  return {
    total,
    critical,
    resolved,
    memoryInformed,
    memoryInfluenceRate
  };
}
