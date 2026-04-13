import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function registerUtilityCommands(
  context: vscode.ExtensionContext,
  workspaceRoot: string
): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];

  // Command: resolveNote
  disposables.push(
    vscode.commands.registerCommand('sapstack.resolveNote', async () => {
      const keyword = await vscode.window.showInputBox({
        prompt: 'Enter SAP Note keyword',
        placeHolder: 'e.g., payment, posting',
      });

      if (!keyword) {
        return;
      }

      vscode.window.showInformationMessage(`SAP Note search for "${keyword}" — coming soon`);
    })
  );

  // Command: checkTcode
  disposables.push(
    vscode.commands.registerCommand('sapstack.checkTcode', async () => {
      const tcode = await vscode.window.showInputBox({
        prompt: 'Enter T-code to verify',
        placeHolder: 'e.g., F110, MIGO',
        validateInput: (value) => {
          if (!/^[A-Z0-9]+$/.test(value)) {
            return 'T-code should be uppercase alphanumeric';
          }
          return '';
        },
      });

      if (!tcode) {
        return;
      }

      vscode.window.showInformationMessage(`T-code ${tcode} verification — coming soon`);
    })
  );

  // Command: listPlugins
  disposables.push(
    vscode.commands.registerCommand('sapstack.listPlugins', async () => {
      const pluginsPath = path.join(workspaceRoot, 'plugins');

      if (!fs.existsSync(pluginsPath)) {
        vscode.window.showWarningMessage('No plugins directory found');
        return;
      }

      try {
        const entries = fs.readdirSync(pluginsPath);
        const plugins = entries.filter((e) =>
          fs.statSync(path.join(pluginsPath, e)).isDirectory()
        );

        if (plugins.length === 0) {
          vscode.window.showInformationMessage('No plugins found');
          return;
        }

        const selected = await vscode.window.showQuickPick(plugins, {
          placeHolder: 'Select plugin to view',
        });

        if (!selected) {
          return;
        }

        // Open plugin SKILL.md if it exists
        const skillMd = path.join(
          pluginsPath,
          selected,
          'skills',
          selected.replace('sap-', ''),
          'SKILL.md'
        );

        if (fs.existsSync(skillMd)) {
          await vscode.window.showTextDocument(vscode.Uri.file(skillMd));
        } else {
          vscode.window.showWarningMessage(`SKILL.md not found for ${selected}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to list plugins: ${message}`);
      }
    })
  );

  // Command: runQualityGates
  disposables.push(
    vscode.commands.registerCommand('sapstack.runQualityGates', async () => {
      vscode.window.showInformationMessage('Quality gates check — coming in v1.7.0');
    })
  );

  return disposables;
}
