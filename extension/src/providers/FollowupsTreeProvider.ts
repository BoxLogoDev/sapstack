import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { YamlManager, ISessionState } from '../utils/yaml';

export class FollowupTreeItem extends vscode.TreeItem {
  constructor(
    public readonly sessionId: string,
    public readonly followupId: string,
    public readonly estimatedMinutes: number,
    public readonly checksCount: number
  ) {
    const label = `${sessionId} · ${followupId} (${estimatedMinutes}m)`;
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.description = `${checksCount} checks`;
    this.iconPath = new vscode.ThemeIcon('checklist');
  }
}

export class CheckTreeItem extends vscode.TreeItem {
  constructor(
    public readonly checkId: string,
    public readonly description: string,
    public readonly priority: 'critical' | 'high' | 'medium' | 'low',
    public readonly estimatedMinutes: number,
    public readonly completed: boolean
  ) {
    const icon = completed ? '✓' : '☐';
    const priorityEmoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
    }[priority];

    const label = `${icon} ${checkId} · ${priorityEmoji} ${priority}`;
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = `${description.substring(0, 40)}... (${estimatedMinutes}m)`;
    this.iconPath = new vscode.ThemeIcon(completed ? 'check' : 'circle-outline');
  }
}

export class FollowupsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    vscode.TreeItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private followupsCache: Map<string, FollowupTreeItem> = new Map();

  constructor(private workspaceRoot: string) {
    this.loadFollowups();
  }

  refresh(): void {
    this.followupsCache.clear();
    this.loadFollowups();
    this._onDidChangeTreeData.fire();
  }

  private loadFollowups(): void {
    const sessionsPath = path.join(this.workspaceRoot, '.sapstack', 'sessions');
    if (!fs.existsSync(sessionsPath)) {
      return;
    }

    try {
      const sessionDirs = fs.readdirSync(sessionsPath);
      for (const dir of sessionDirs) {
        const sessionDir = path.join(sessionsPath, dir);
        if (!fs.statSync(sessionDir).isDirectory()) {
          continue;
        }

        const state = YamlManager.loadSessionState(sessionDir);
        if (
          state &&
          state.status === 'awaiting_evidence' &&
          state.pending_followup_request_id
        ) {
          // Load the follow-up request file
          const followupId = state.pending_followup_request_id;
          const followupPath = path.join(
            sessionDir,
            'requests',
            `${followupId}.yaml`
          );

          if (fs.existsSync(followupPath)) {
            try {
              const followupData = YamlManager.loadYaml(followupPath);
              if (followupData && followupData.checks) {
                const estimatedMinutes = followupData.checks.reduce(
                  (sum: number, check: any) => sum + (check.estimated_minutes || 5),
                  0
                );
                const item = new FollowupTreeItem(
                  state.session_id,
                  followupId,
                  estimatedMinutes,
                  followupData.checks.length
                );
                this.followupsCache.set(followupId, item);
              }
            } catch (error) {
              console.error(`Error loading followup ${followupPath}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading followups:', error);
    }
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (!element) {
      // Root level - return all pending followups
      return Array.from(this.followupsCache.values());
    }

    if (element instanceof FollowupTreeItem) {
      // Load and return checks for this followup
      const sessionsPath = path.join(this.workspaceRoot, '.sapstack', 'sessions');
      const sessionDir = path.join(sessionsPath, element.sessionId);
      const followupPath = path.join(sessionDir, 'requests', `${element.followupId}.yaml`);

      if (fs.existsSync(followupPath)) {
        const followupData = YamlManager.loadYaml(followupPath);
        if (followupData && followupData.checks) {
          return followupData.checks.map(
            (check: any) =>
              new CheckTreeItem(
                check.check_id,
                check.description,
                check.priority || 'medium',
                check.estimated_minutes || 5,
                check.completed || false
              )
          );
        }
      }
    }

    return [];
  }

  getParent(element: vscode.TreeItem): vscode.TreeItem | undefined {
    return undefined;
  }
}
