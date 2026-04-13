import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { YamlManager, ISessionState } from '../utils/yaml';

export class SessionTreeItem extends vscode.TreeItem {
  constructor(
    public readonly sessionId: string,
    public readonly sessionDir: string,
    public readonly state: ISessionState,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState =
      vscode.TreeItemCollapsibleState.Collapsed
  ) {
    const statusIcon = getStatusIcon(state.status);
    const label = `${statusIcon} ${sessionId} · ${state.status}`;
    const description = state.initial_symptom?.description.substring(0, 50) + '...';

    super(label, collapsibleState);
    this.description = description;
    this.contextValue = 'sessionItem';
    this.iconPath = new vscode.ThemeIcon('notebook');
    this.tooltip = new vscode.MarkdownString(
      `**Session ID**: ${sessionId}\n\n**Status**: ${state.status}\n\n**Symptom**: ${state.initial_symptom?.description}`
    );
  }
}

export class TurnTreeItem extends vscode.TreeItem {
  constructor(
    public readonly turnNumber: number,
    public readonly turnType: string,
    public readonly status: string,
    public readonly fileUri: vscode.Uri | null
  ) {
    const turnIcon = getTurnIcon(turnType);
    const label = `${turnIcon} Turn ${turnNumber} — ${turnType.toUpperCase()}`;

    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = `(${status})`;
    this.iconPath = new vscode.ThemeIcon('file-yaml');

    if (fileUri) {
      this.command = {
        title: 'Open turn file',
        command: 'vscode.open',
        arguments: [fileUri],
      };
    }
  }
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    intake: '📥',
    hypothesizing: '💡',
    awaiting_evidence: '⏳',
    verifying: '⚖️',
    resolved: '✅',
    escalated: '🔴',
    abandoned: '❌',
    reopened: '🔄',
  };
  return icons[status] || '❓';
}

function getTurnIcon(turnType: string): string {
  const icons: Record<string, string> = {
    intake: '📦',
    hypothesis: '💡',
    collect: '📥',
    verify: '⚖️',
  };
  return icons[turnType] || '❓';
}

export class SessionsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    vscode.TreeItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private sessionsCache: Map<string, SessionTreeItem> = new Map();

  constructor(private workspaceRoot: string) {
    this.loadSessions();
  }

  refresh(): void {
    this.sessionsCache.clear();
    this.loadSessions();
    this._onDidChangeTreeData.fire();
  }

  private loadSessions(): void {
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
        if (state) {
          const item = new SessionTreeItem(
            state.session_id,
            sessionDir,
            state,
            vscode.TreeItemCollapsibleState.Collapsed
          );
          this.sessionsCache.set(state.session_id, item);
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (!element) {
      // Root level - return all sessions
      return Array.from(this.sessionsCache.values()).sort((a, b) => {
        return b.state.created_at.localeCompare(a.state.created_at);
      });
    }

    if (element instanceof SessionTreeItem) {
      // Return turns for this session
      return element.state.turns.map(
        (turn, index) =>
          new TurnTreeItem(turn.turn_number, turn.turn_type, turn.status, null)
      );
    }

    return [];
  }

  getParent(element: vscode.TreeItem): vscode.TreeItem | undefined {
    return undefined;
  }
}
