import * as vscode from 'vscode';
import { SessionsTreeProvider } from './providers/SessionsTreeProvider';
import { FollowupsTreeProvider } from './providers/FollowupsTreeProvider';
import { PluginsTreeProvider } from './providers/PluginsTreeProvider';
import { registerSessionCommands } from './commands/sessionCommands';
import { registerUtilityCommands } from './commands/utilityCommands';
import { SessionWatcher } from './utils/sessionWatcher';

let sessionWatcher: SessionWatcher | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const outputChannel = vscode.window.createOutputChannel('sapstack');

  try {
    outputChannel.appendLine('[sapstack] Extension activating...');

    // Get workspace root
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      outputChannel.appendLine(
        '[sapstack] No workspace folder found. Extension will remain idle.'
      );
      return;
    }

    // Initialize tree providers
    const sessionsProvider = new SessionsTreeProvider(workspaceRoot);
    const followupsProvider = new FollowupsTreeProvider(workspaceRoot);
    const pluginsProvider = new PluginsTreeProvider(workspaceRoot);

    // Register tree views
    vscode.window.registerTreeDataProvider('sapstack.sessions', sessionsProvider);
    vscode.window.registerTreeDataProvider('sapstack.followups', followupsProvider);
    vscode.window.registerTreeDataProvider('sapstack.plugins', pluginsProvider);

    // Register commands
    const sessionCommandDisposables = registerSessionCommands(
      context,
      workspaceRoot,
      sessionsProvider,
      followupsProvider
    );
    const utilityCommandDisposables = registerUtilityCommands(context, workspaceRoot);

    context.subscriptions.push(...sessionCommandDisposables);
    context.subscriptions.push(...utilityCommandDisposables);

    // Initialize file watcher for auto-refresh
    sessionWatcher = new SessionWatcher(workspaceRoot, sessionsProvider, followupsProvider);
    context.subscriptions.push(sessionWatcher);

    // Add status bar item
    const statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBar.command = 'sapstack.session.resume';
    statusBar.tooltip = 'Click to resume a sapstack session';
    statusBar.show();
    context.subscriptions.push(statusBar);

    // Update status bar with current session (if configured)
    const updateStatusBar = async () => {
      const config = vscode.workspace.getConfiguration('sapstack');
      const currentSessionId = config.get<string>('currentSessionId');
      if (currentSessionId) {
        statusBar.text = `$(tools) sapstack: ${currentSessionId}`;
      } else {
        statusBar.text = '$(tools) sapstack';
      }
    };

    updateStatusBar();
    const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('sapstack.currentSessionId')) {
        updateStatusBar();
      }
    });
    context.subscriptions.push(configWatcher);

    outputChannel.appendLine('[sapstack] Extension activated successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    outputChannel.appendLine(`[sapstack] Activation error: ${message}`);
    vscode.window.showErrorMessage(`sapstack activation failed: ${message}`);
  }
}

export function deactivate(): void {
  if (sessionWatcher) {
    sessionWatcher.dispose();
  }
}
