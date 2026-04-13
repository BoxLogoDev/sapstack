import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { YamlManager, ISessionState } from '../utils/yaml';
import { SchemaValidator } from '../utils/schemaValidator';
import { SessionsTreeProvider } from '../providers/SessionsTreeProvider';
import { FollowupsTreeProvider } from '../providers/FollowupsTreeProvider';

const validator = new SchemaValidator();

export function registerSessionCommands(
  context: vscode.ExtensionContext,
  workspaceRoot: string,
  sessionsProvider: SessionsTreeProvider,
  followupsProvider: FollowupsTreeProvider
): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];

  // Command: session.start
  disposables.push(
    vscode.commands.registerCommand('sapstack.session.start', async () => {
      try {
        // Prompt for symptom description
        const symptom = await vscode.window.showInputBox({
          prompt: '증상을 설명해주세요 (Describe the symptom)',
          placeHolder: 'e.g., F110 제안 실패 / F110 Proposal failed',
          validateInput: (value) => {
            if (value.length < 10) {
              return '증상은 최소 10자 이상이어야 합니다';
            }
            return '';
          },
        });

        if (!symptom) {
          return;
        }

        // Prompt for reporter role
        const reporter = await vscode.window.showQuickPick(
          ['end_user', 'operator', 'consultant', 'basis'],
          {
            placeHolder: 'Select your role',
          }
        );

        if (!reporter) {
          return;
        }

        // Prompt for language
        const language = await vscode.window.showQuickPick(['ko', 'en', 'de', 'ja'], {
          placeHolder: 'Select language',
        });

        if (!language) {
          return;
        }

        // Create session directory
        const sessionId = YamlManager.generateSessionId();
        const sessionsPath = path.join(workspaceRoot, '.sapstack', 'sessions', sessionId);
        fs.mkdirSync(sessionsPath, { recursive: true });
        fs.mkdirSync(path.join(sessionsPath, 'bundles'), { recursive: true });
        fs.mkdirSync(path.join(sessionsPath, 'hypotheses'), { recursive: true });
        fs.mkdirSync(path.join(sessionsPath, 'requests'), { recursive: true });
        fs.mkdirSync(path.join(sessionsPath, 'verdicts'), { recursive: true });

        // Create initial state
        const now = new Date().toISOString();
        const state: ISessionState = {
          session_id: sessionId,
          schema_version: '1.0.0',
          created_at: now,
          last_updated_at: now,
          status: 'intake',
          initial_symptom: {
            description: symptom,
            reporter_role: reporter,
            language: language,
            country_iso: getCountryFromLanguage(language),
          },
          current_turn_number: 1,
          turns: [
            {
              turn_number: 1,
              turn_type: 'intake',
              status: 'active',
              started_at: now,
            },
          ],
          audit_trail: [
            {
              at: now,
              action: 'session_created',
              actor: { role: reporter },
              ref_id: sessionId,
              note: symptom,
            },
          ],
          tags: [],
          related_sessions: [],
        };

        // Validate state
        const validation = validator.validateSessionState(state);
        if (!validation.valid) {
          vscode.window.showErrorMessage(`Validation failed: ${validation.errors?.join(', ')}`);
          return;
        }

        // Save state
        YamlManager.saveSessionState(sessionsPath, state);

        // Store current session in config
        await vscode.workspace
          .getConfiguration('sapstack')
          .update('currentSessionId', sessionId, vscode.ConfigurationTarget.Workspace);

        // Refresh providers
        sessionsProvider.refresh();

        vscode.window.showInformationMessage(
          `Session started: ${sessionId}`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to start session: ${message}`);
      }
    })
  );

  // Command: session.resume
  disposables.push(
    vscode.commands.registerCommand('sapstack.session.resume', async () => {
      try {
        const sessionsPath = path.join(workspaceRoot, '.sapstack', 'sessions');
        if (!fs.existsSync(sessionsPath)) {
          vscode.window.showWarningMessage('No sessions found');
          return;
        }

        const sessionDirs = fs.readdirSync(sessionsPath);
        if (sessionDirs.length === 0) {
          vscode.window.showWarningMessage('No sessions found');
          return;
        }

        // Load all sessions and show as quick pick
        const items: vscode.QuickPickItem[] = [];
        for (const dir of sessionDirs) {
          const sessionDir = path.join(sessionsPath, dir);
          const state = YamlManager.loadSessionState(sessionDir);
          if (state) {
            items.push({
              label: state.session_id,
              description: `${state.status} · ${state.initial_symptom.description.substring(0, 40)}...`,
              detail: state.created_at,
            });
          }
        }

        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: 'Select a session to resume',
        });

        if (!selected) {
          return;
        }

        // Update current session
        await vscode.workspace
          .getConfiguration('sapstack')
          .update('currentSessionId', selected.label, vscode.ConfigurationTarget.Workspace);

        // Open state.yaml
        const stateFile = vscode.Uri.file(
          path.join(sessionsPath, selected.label, 'state.yaml')
        );
        await vscode.window.showTextDocument(stateFile);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to resume session: ${message}`);
      }
    })
  );

  // Command: session.addEvidence
  disposables.push(
    vscode.commands.registerCommand('sapstack.session.addEvidence', async () => {
      try {
        // Get current session
        const config = vscode.workspace.getConfiguration('sapstack');
        const sessionId = config.get<string>('currentSessionId');

        if (!sessionId) {
          vscode.window.showErrorMessage('No current session. Start or resume a session first.');
          return;
        }

        // File picker
        const files = await vscode.window.showOpenDialog({
          defaultUri: vscode.Uri.file(workspaceRoot),
          title: 'Select evidence file(s)',
          canSelectMany: true,
          canSelectFiles: true,
          canSelectFolders: false,
        });

        if (!files || files.length === 0) {
          return;
        }

        // Process each file
        const sessionDir = path.join(workspaceRoot, '.sapstack', 'sessions', sessionId);
        const bundlesDir = path.join(sessionDir, 'bundles');
        fs.mkdirSync(bundlesDir, { recursive: true });

        for (const fileUri of files) {
          const filePath = fileUri.fsPath;
          const fileName = path.basename(filePath);

          // Calculate hash
          const content = fs.readFileSync(filePath, 'utf-8');
          const hash = crypto
            .createHash('sha256')
            .update(content)
            .digest('hex')
            .substring(0, 6);

          // Create bundle entry
          const bundleId = YamlManager.generateBundleId();
          const bundleData = {
            bundle_id: bundleId,
            collected_at: new Date().toISOString(),
            source_file: fileName,
            file_hash: hash,
            file_size_bytes: fs.statSync(filePath).size,
            evidence_items: [
              {
                item_id: `item-001`,
                type: 'log',
                description: `Evidence from ${fileName}`,
                confidence: 0.8,
                content_preview: content.substring(0, 200),
              },
            ],
          };

          // Validate
          const validation = validator.validateEvidenceBundle(bundleData);
          if (!validation.valid) {
            vscode.window.showWarningMessage(
              `Invalid bundle for ${fileName}: ${validation.errors?.join(', ')}`
            );
            continue;
          }

          // Save bundle
          const bundleFile = path.join(bundlesDir, `${bundleId}.yaml`);
          YamlManager.saveYaml(bundleFile, bundleData);

          vscode.window.showInformationMessage(
            `Evidence added: ${bundleId}`
          );
        }

        // Refresh providers
        sessionsProvider.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to add evidence: ${message}`);
      }
    })
  );

  // Command: session.nextTurn
  disposables.push(
    vscode.commands.registerCommand('sapstack.session.nextTurn', async () => {
      try {
        const config = vscode.workspace.getConfiguration('sapstack');
        const sessionId = config.get<string>('currentSessionId');

        if (!sessionId) {
          vscode.window.showErrorMessage('No current session selected');
          return;
        }

        const sessionDir = path.join(workspaceRoot, '.sapstack', 'sessions', sessionId);
        const state = YamlManager.loadSessionState(sessionDir);

        if (!state) {
          vscode.window.showErrorMessage('Failed to load session state');
          return;
        }

        // Determine next turn type
        let nextTurnType: 'hypothesis' | 'collect' | 'verify' = 'hypothesis';
        const currentTurn = state.turns[state.turns.length - 1];

        if (currentTurn.turn_type === 'intake') {
          nextTurnType = 'hypothesis';
        } else if (currentTurn.turn_type === 'hypothesis') {
          nextTurnType = 'collect';
        } else if (currentTurn.turn_type === 'collect') {
          nextTurnType = 'verify';
        }

        // Create next turn
        const now = new Date().toISOString();
        const nextTurn = {
          turn_number: state.current_turn_number + 1,
          turn_type: nextTurnType,
          status: 'active' as const,
          started_at: now,
        };

        state.turns.push(nextTurn);
        state.current_turn_number += 1;

        // Update status based on turn type
        if (nextTurnType === 'hypothesis') {
          state.status = 'hypothesizing';
        } else if (nextTurnType === 'collect') {
          state.status = 'awaiting_evidence';
        } else if (nextTurnType === 'verify') {
          state.status = 'verifying';
        }

        // Save state
        YamlManager.saveSessionState(sessionDir, state);
        sessionsProvider.refresh();

        vscode.window.showInformationMessage(
          `Turn ${nextTurn.turn_number} (${nextTurnType}) started`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to advance turn: ${message}`);
      }
    })
  );

  // Command: session.viewEvidence
  disposables.push(
    vscode.commands.registerCommand('sapstack.session.viewEvidence', async () => {
      try {
        const config = vscode.workspace.getConfiguration('sapstack');
        const sessionId = config.get<string>('currentSessionId');

        if (!sessionId) {
          vscode.window.showErrorMessage('No current session selected');
          return;
        }

        const bundlesDir = path.join(
          workspaceRoot,
          '.sapstack',
          'sessions',
          sessionId,
          'bundles'
        );

        if (!fs.existsSync(bundlesDir)) {
          vscode.window.showInformationMessage('No evidence bundles found');
          return;
        }

        const files = fs.readdirSync(bundlesDir).filter((f) => f.endsWith('.yaml'));

        if (files.length === 0) {
          vscode.window.showInformationMessage('No evidence bundles found');
          return;
        }

        const selected = await vscode.window.showQuickPick(files, {
          placeHolder: 'Select evidence bundle to view',
        });

        if (!selected) {
          return;
        }

        const bundleFile = vscode.Uri.file(path.join(bundlesDir, selected));
        await vscode.window.showTextDocument(bundleFile);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to view evidence: ${message}`);
      }
    })
  );

  // Stub commands (placeholders for future implementation)
  const stubCommands = [
    'sapstack.session.showFollowup',
    'sapstack.session.showVerdict',
    'sapstack.session.handoff',
    'sapstack.session.exportBundle',
    'sapstack.session.openInWeb',
  ];

  for (const cmd of stubCommands) {
    disposables.push(
      vscode.commands.registerCommand(cmd, () => {
        vscode.window.showInformationMessage(`Command ${cmd} coming in v1.7.0`);
      })
    );
  }

  return disposables;
}

function getCountryFromLanguage(language: string): string {
  const mapping: Record<string, string> = {
    ko: 'kr',
    en: 'us',
    de: 'de',
    ja: 'jp',
  };
  return mapping[language] || 'none';
}
