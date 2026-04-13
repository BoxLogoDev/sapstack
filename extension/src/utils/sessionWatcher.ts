import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SessionsTreeProvider } from '../providers/SessionsTreeProvider';
import { FollowupsTreeProvider } from '../providers/FollowupsTreeProvider';

export class SessionWatcher implements vscode.Disposable {
  private watcher: vscode.FileSystemWatcher | undefined;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly debounceMs = 500;

  constructor(
    private workspaceRoot: string,
    private sessionsProvider: SessionsTreeProvider,
    private followupsProvider: FollowupsTreeProvider
  ) {
    this.setupWatcher();
  }

  private setupWatcher(): void {
    const sessionsPath = path.join(this.workspaceRoot, '.sapstack', 'sessions');

    // Ensure the directory exists before setting up the watcher
    if (!fs.existsSync(sessionsPath)) {
      return;
    }

    const pattern = new vscode.RelativePattern(sessionsPath, '**/*.yaml');
    this.watcher = vscode.workspace.createFileSystemWatcher(pattern);

    this.watcher.onDidChange((uri) => this.handleFileChange(uri));
    this.watcher.onDidCreate((uri) => this.handleFileChange(uri));
    this.watcher.onDidDelete((uri) => this.handleFileChange(uri));
  }

  private handleFileChange(uri: vscode.Uri): void {
    // Debounce refresh to avoid multiple updates for the same file
    const filePath = uri.fsPath;

    // Clear existing timer for this file
    if (this.debounceTimers.has(filePath)) {
      clearTimeout(this.debounceTimers.get(filePath));
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.sessionsProvider.refresh();
      this.followupsProvider.refresh();
      this.debounceTimers.delete(filePath);
    }, this.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  dispose(): void {
    if (this.watcher) {
      this.watcher.dispose();
    }
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}
