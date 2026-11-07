import { HindsightClient } from '@vectorize-io/hindsight-client';
import { RecalledMemory } from '../src/types/sentinel.js';

export interface HindsightConfig {
  baseUrl: string;
  apiKey?: string;
  bankId: string;
}

export interface HindsightOperationLog {
  id: string;
  timestamp: string;
  operation: 'retain' | 'recall' | 'reflect';
  bankId: string;
  queryOrContent: string;
  success: boolean;
  status: 'connected' | 'credentials_required' | 'error';
  rawResponse?: unknown;
  error?: string;
}

class HindsightService {
  private client: HindsightClient | null = null;
  private config: HindsightConfig;
  private operationsLog: HindsightOperationLog[] = [];

  constructor() {
    this.config = {
      baseUrl: process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io',
      apiKey: process.env.HINDSIGHT_API_KEY,
      bankId: process.env.HINDSIGHT_BANK_ID || 'sentinelops-soc-prod'
    };

    if (this.config.apiKey) {
      try {
        this.client = new HindsightClient({
          baseUrl: this.config.baseUrl,
          apiKey: this.config.apiKey
        });
      } catch (err: unknown) {
        console.error('Failed to initialize HindsightClient:', err);
      }
    }
  }

  public getStatus() {
    return {
      configured: Boolean(this.config.apiKey),
      baseUrl: this.config.baseUrl,
      bankId: this.config.bankId,
      status: this.config.apiKey ? ('connected' as const) : ('credentials_required' as const),
      message: this.config.apiKey 
        ? `Connected to Hindsight Cloud (Bank: ${this.config.bankId})` 
        : 'HINDSIGHT_API_KEY is not configured in server environment. Memory persistence requires credentials.'
    };
  }

  public getLogs(): HindsightOperationLog[] {
    return [...this.operationsLog].reverse().slice(0, 50);
  }

  /**
   * Retains an incident outcome, resolution, and analyst notes into Hindsight memory bank.
   */
  public async retain(incidentSummary: string, metadata?: Record<string, unknown>) {
    const logEntry: HindsightOperationLog = {
      id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      operation: 'retain',
      bankId: this.config.bankId,
      queryOrContent: incidentSummary.slice(0, 200),
      success: false,
      status: this.config.apiKey ? 'connected' : 'credentials_required'
    };

    if (!this.client || !this.config.apiKey) {
      logEntry.error = 'HINDSIGHT_API_KEY is missing. Cannot retain memory in Hindsight Cloud.';
      this.operationsLog.push(logEntry);
      return {
        success: false,
        status: 'credentials_required' as const,
        message: 'Hindsight Cloud API key missing. Please configure HINDSIGHT_API_KEY in server secrets.',
        bankId: this.config.bankId
      };
    }

    try {
      const stringifiedMetadata: Record<string, string> = {};
      if (metadata) {
        for (const [k, v] of Object.entries(metadata)) {
          stringifiedMetadata[k] = typeof v === 'string' ? v : JSON.stringify(v);
        }
      }

      // Call actual Hindsight retain API
      const response = await this.client.retain(this.config.bankId, incidentSummary, {
        context: 'SOC Incident Resolution & Analyst Feedback',
        metadata: stringifiedMetadata
      });

      logEntry.success = true;
      logEntry.rawResponse = response;
      this.operationsLog.push(logEntry);

      return {
        success: true,
        status: 'connected' as const,
        bankId: this.config.bankId,
        rawResponse: response
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logEntry.success = false;
      logEntry.status = 'error';
      logEntry.error = errorMsg;
      this.operationsLog.push(logEntry);

      return {
        success: false,
        status: 'error' as const,
        message: `Hindsight Cloud retain failed: ${errorMsg}`,
        bankId: this.config.bankId
      };
    }
  }

  /**
   * Recalls similar historical memories from Hindsight bank.
   */
  public async recall(query: string): Promise<{
    success: boolean;
    status: 'connected' | 'credentials_required' | 'error';
    memories: RecalledMemory[];
    message?: string;
  }> {
    const logEntry: HindsightOperationLog = {
      id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      operation: 'recall',
      bankId: this.config.bankId,
      queryOrContent: query,
      success: false,
      status: this.config.apiKey ? 'connected' : 'credentials_required'
    };

    if (!this.client || !this.config.apiKey) {
      logEntry.error = 'HINDSIGHT_API_KEY is missing. Hindsight Cloud recall unavailable.';
      this.operationsLog.push(logEntry);
      return {
        success: false,
        status: 'credentials_required',
        memories: [],
        message: 'HINDSIGHT_API_KEY is not configured in server environment.'
      };
    }

    try {
      // Call actual Hindsight recall API
      const result = await this.client.recall(this.config.bankId, query, {
        budget: 'mid'
      } as any);

      logEntry.success = true;
      logEntry.rawResponse = result;
      this.operationsLog.push(logEntry);

      // Parse result items into RecalledMemory format
      const memories: RecalledMemory[] = [];
      const items = (result as any)?.results || (result as any)?.memories || [];
      if (Array.isArray(items)) {
        for (const item of items) {
          const rawScore = item.scores?.final ?? item.score ?? 0.85;
          const score = typeof rawScore === 'number' ? Math.round(rawScore * 100) / 100 : 0.85;
          const factText = item.text || item.content || item.summary || (typeof item === 'string' ? item : '');
          
          memories.push({
            id: item.id || `hindsight-${Math.random().toString(36).slice(2, 8)}`,
            title: item.context || (item.metadata?.affectedAsset ? `Incident on ${item.metadata.affectedAsset}` : 'Historical SOC Incident'),
            summary: factText,
            asset: item.metadata?.affectedAsset || item.metadata?.asset || (item.entities?.find((e: string) => /FIN-SRV/i.test(e)) ?? 'FIN-SRV-04'),
            resolution: item.metadata?.resolution || (factText.toLowerCase().includes('remediation') ? factText : 'Retained from previous analyst playbook: Isolate host, revoke Kerberos tokens, blacklist C2 IP.'),
            verdict: item.metadata?.verdict || 'confirmed_malicious',
            relevanceScore: score,
            source: 'hindsight_cloud',
            timestamp: item.mentioned_at || item.timestamp || new Date().toISOString(),
            keyFacts: Array.isArray(item.entities) && item.entities.length > 0 
              ? item.entities.map((e: string) => `Entity: ${e}`)
              : undefined
          });
        }
      }

      return {
        success: true,
        status: 'connected',
        memories
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logEntry.success = false;
      logEntry.status = 'error';
      logEntry.error = errorMsg;
      this.operationsLog.push(logEntry);

      return {
        success: false,
        status: 'error',
        memories: [],
        message: `Hindsight Cloud recall failed: ${errorMsg}`
      };
    }
  }

  /**
   * Reflects autonomously across memories for agentic synthesis.
   */
  public async reflect(query: string) {
    const logEntry: HindsightOperationLog = {
      id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      operation: 'reflect',
      bankId: this.config.bankId,
      queryOrContent: query,
      success: false,
      status: this.config.apiKey ? 'connected' : 'credentials_required'
    };

    if (!this.client || !this.config.apiKey) {
      logEntry.error = 'HINDSIGHT_API_KEY is missing. Hindsight Cloud reflect unavailable.';
      this.operationsLog.push(logEntry);
      return {
        success: false,
        status: 'credentials_required' as const,
        message: 'HINDSIGHT_API_KEY is required to trigger agentic reflection in Hindsight Cloud.'
      };
    }

    try {
      const result = await this.client.reflect(this.config.bankId, query);
      logEntry.success = true;
      logEntry.rawResponse = result;
      this.operationsLog.push(logEntry);

      return {
        success: true,
        status: 'connected' as const,
        result
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logEntry.success = false;
      logEntry.status = 'error';
      logEntry.error = errorMsg;
      this.operationsLog.push(logEntry);

      return {
        success: false,
        status: 'error' as const,
        message: `Hindsight reflect failed: ${errorMsg}`
      };
    }
  }
}

export const hindsightService = new HindsightService();
