import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { incidentStore } from './server/incidentStore.js';
import { hindsightService } from './server/hindsightService.js';
import { geminiService } from './server/geminiService.js';
import { validateSecurityAlert, buildMemoryRecallQuery } from './src/utils/alertValidator.js';
import { computeIncidentMetrics } from './src/utils/memoryMatcher.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// --- API Endpoints ---

// System & Integration Status
app.get('/api/status', (_req, res) => {
  const incidents = incidentStore.getAll();
  const metrics = computeIncidentMetrics(incidents);
  const hindsightStatus = hindsightService.getStatus();
  const geminiStatus = geminiService.getStatus();

  res.json({
    gemini: geminiStatus,
    hindsight: hindsightStatus,
    stats: {
      totalIncidents: metrics.total,
      criticalAlerts: metrics.critical,
      resolvedIncidents: metrics.resolved,
      retainedMemoriesCount: incidentStore.getLocalMemories().length,
      recallQueriesCount: incidentStore.getRecallCount(),
      memoryInfluenceRate: metrics.memoryInfluenceRate
    }
  });
});

// Incidents List
app.get('/api/incidents', (_req, res) => {
  const incidents = incidentStore.getAll();
  res.json({ incidents });
});

// Incident Details
app.get('/api/incidents/:id', (req, res) => {
  const incident = incidentStore.getById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json({ incident });
});

// Ingest New Alert
app.post('/api/incidents', (req, res) => {
  const validation = validateSecurityAlert(req.body);
  if (!validation.valid || !validation.alert) {
    return res.status(400).json({ error: 'Invalid alert payload', details: validation.errors });
  }

  const newIncident = incidentStore.create(validation.alert);
  res.status(201).json({ incident: newIncident });
});

// AI Investigation with Memory Recall Workflow
app.post('/api/incidents/:id/investigate', async (req, res) => {
  const incident = incidentStore.getById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  incidentStore.incrementRecallCount();

  // Step 1: Query Hindsight memory for similar historical incidents
  const recallQuery = buildMemoryRecallQuery(incident.alert);
  const hindsightResult = await hindsightService.recall(recallQuery);

  let recalledMemories = hindsightResult.memories;

  // Fallback to local persistent organizational store if Hindsight Cloud is offline / without credentials
  if (recalledMemories.length === 0) {
    recalledMemories = incidentStore.searchLocalMemories(incident.alert, incident.id);
  }

  // Step 2: Use retrieved memories as context for Gemini AI investigation
  const analysis = await geminiService.analyzeIncident(incident.alert, recalledMemories);

  // Step 3: Update incident with investigation results
  const updated = incidentStore.update(incident.id, {
    status: incident.status === 'new' ? 'investigating' : incident.status,
    investigation: analysis,
    recalledMemories
  });

  res.json({
    incident: updated,
    investigation: analysis,
    recalledMemories,
    hindsightStatus: hindsightService.getStatus(),
    recallQuery
  });
});

// Analyst Feedback & Hindsight Retention
app.post('/api/incidents/:id/feedback', async (req, res) => {
  const incident = incidentStore.getById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const { verdict, analystName, notes, rootCause, remediationTaken } = req.body;

  if (!verdict || !notes) {
    return res.status(400).json({ error: 'Verdict and investigation notes are required' });
  }

  // Retain the outcome and resolution in Hindsight Cloud
  const memoryContent = `Incident ${incident.alert.title} on asset ${incident.alert.affectedAsset}.
Verdict: ${verdict}.
Root Cause: ${rootCause || 'Observed anomalous behavior'}.
Remediation & Playbook Actions: ${remediationTaken || 'Host reviewed by SOC'}.
Analyst Notes: ${notes}.
Process: ${incident.alert.processName || 'N/A'}. Command: ${incident.alert.commandLine || 'N/A'}.`;

  const metadata = {
    incidentId: incident.id,
    alertId: incident.alert.alertId,
    affectedAsset: incident.alert.affectedAsset,
    verdict,
    severity: incident.alert.severity,
    processName: incident.alert.processName
  };

  const hindsightRetainResult = await hindsightService.retain(memoryContent, metadata);

  const feedbackData = {
    verdict,
    analystName: analystName || 'Current SOC Analyst',
    notes,
    rootCause: rootCause || '',
    remediationTaken: remediationTaken || '',
    retainedInHindsight: hindsightRetainResult.success,
    hindsightResponse: {
      success: hindsightRetainResult.success,
      bankId: hindsightRetainResult.bankId,
      message: hindsightRetainResult.message || (hindsightRetainResult.success ? 'Retained in Hindsight Cloud' : 'Credentials required')
    },
    submittedAt: new Date().toISOString()
  };

  const updated = incidentStore.update(incident.id, {
    status: verdict,
    feedback: feedbackData
  });

  res.json({
    incident: updated,
    feedback: feedbackData,
    hindsightRetainResult
  });
});

// Hindsight Memory Explorer Endpoints
app.get('/api/hindsight/memories', (_req, res) => {
  const localMemories = incidentStore.getLocalMemories();
  const status = hindsightService.getStatus();
  res.json({
    status,
    memories: localMemories
  });
});

app.post('/api/hindsight/recall-test', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const result = await hindsightService.recall(query);
  res.json(result);
});

app.post('/api/hindsight/reflect', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const result = await hindsightService.reflect(query);
  res.json(result);
});

app.get('/api/hindsight/logs', (_req, res) => {
  res.json({ logs: hindsightService.getLogs() });
});

// Demo Scenario Reset
app.post('/api/demo/reset', async (_req, res) => {
  const incidents = incidentStore.resetToDemo();
  
  // Retain FIN-SRV-04 into Hindsight Cloud bank so FIN-SRV-07 can recall it
  const fin04 = incidents.find(i => i.alert.affectedAsset === 'FIN-SRV-04');
  if (fin04 && fin04.feedback) {
    const memoryContent = `Incident ${fin04.alert.title} on asset ${fin04.alert.affectedAsset}.
Verdict: ${fin04.feedback.verdict}.
Root Cause: ${fin04.feedback.rootCause}.
Remediation & Playbook Actions: ${fin04.feedback.remediationTaken}.
Analyst Notes: ${fin04.feedback.notes}.
Process: ${fin04.alert.processName || 'N/A'}. Command: ${fin04.alert.commandLine || 'N/A'}.`;

    const metadata = {
      incidentId: fin04.id,
      alertId: fin04.alert.alertId,
      affectedAsset: fin04.alert.affectedAsset,
      verdict: fin04.feedback.verdict,
      severity: fin04.alert.severity,
      processName: fin04.alert.processName
    };
    await hindsightService.retain(memoryContent, metadata);
  }

  res.json({ success: true, incidents });
});

// --- Server Lifecycle & Vite Middleware Mounting ---
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[SENTINELOPS] SOC Incident Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting SentinelOps server:', err);
  process.exit(1);
});
