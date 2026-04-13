import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'js-yaml';

export interface ISessionState {
  session_id: string;
  schema_version: string;
  created_at: string;
  status:
    | 'intake'
    | 'hypothesizing'
    | 'awaiting_evidence'
    | 'verifying'
    | 'resolved'
    | 'escalated'
    | 'abandoned'
    | 'reopened';
  initial_symptom: {
    description: string;
    reporter_role: string;
    language: string;
    country_iso?: string;
  };
  current_turn_number: number;
  pending_followup_request_id?: string;
  turns: Array<{
    turn_number: number;
    turn_type: 'intake' | 'hypothesis' | 'collect' | 'verify';
    status: 'pending' | 'active' | 'complete' | 'abandoned';
    started_at: string;
    completed_at?: string;
  }>;
  [key: string]: any; // Allow other properties per schema
}

export class YamlManager {
  static loadYaml<T = any>(filePath: string): T | null {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      return YAML.load(content) as T;
    } catch (error) {
      console.error(`Failed to load YAML from ${filePath}:`, error);
      return null;
    }
  }

  static saveYaml(filePath: string, data: any): void {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const yaml = YAML.dump(data, { lineWidth: 120, indent: 2 });
      fs.writeFileSync(filePath, yaml, 'utf-8');
    } catch (error) {
      console.error(`Failed to save YAML to ${filePath}:`, error);
      throw error;
    }
  }

  static loadSessionState(sessionDir: string): ISessionState | null {
    const stateFile = path.join(sessionDir, 'state.yaml');
    return this.loadYaml<ISessionState>(stateFile);
  }

  static saveSessionState(sessionDir: string, state: ISessionState): void {
    const stateFile = path.join(sessionDir, 'state.yaml');
    state.last_updated_at = new Date().toISOString();
    this.saveYaml(stateFile, state);
  }

  static generateSessionId(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `sess-${dateStr}-${randomStr}`;
  }

  static generateBundleId(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `evb-${dateStr}-${randomStr}`;
  }

  static generateFollowupId(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `flr-${dateStr}-${randomStr}`;
  }

  static generateHypothesisId(count: number): string {
    return `h-${String(count).padStart(3, '0')}`;
  }

  static generateVerdictId(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `vdc-${dateStr}-${randomStr}`;
  }
}
