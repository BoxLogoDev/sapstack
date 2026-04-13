import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class PluginTreeItem extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly skillMdPath: string | null,
    public readonly version?: string
  ) {
    super(name, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('extensions');
    this.description = version ? `v${version}` : 'v?.?.?';

    if (skillMdPath && fs.existsSync(skillMdPath)) {
      this.command = {
        title: 'Open SKILL.md',
        command: 'vscode.open',
        arguments: [vscode.Uri.file(skillMdPath)],
      };
      this.tooltip = skillMdPath;
    }
  }
}

export class PluginsTreeProvider implements vscode.TreeDataProvider<PluginTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    PluginTreeItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private pluginsCache: PluginTreeItem[] = [];

  constructor(private workspaceRoot: string) {
    this.loadPlugins();
  }

  refresh(): void {
    this.pluginsCache = [];
    this.loadPlugins();
    this._onDidChangeTreeData.fire();
  }

  private loadPlugins(): void {
    const pluginsPath = path.join(this.workspaceRoot, 'plugins');

    if (!fs.existsSync(pluginsPath)) {
      return;
    }

    try {
      const entries = fs.readdirSync(pluginsPath);

      for (const entry of entries) {
        const pluginPath = path.join(pluginsPath, entry);

        if (!fs.statSync(pluginPath).isDirectory()) {
          continue;
        }

        // Look for SKILL.md
        const skillMdPath = path.join(
          pluginPath,
          'skills',
          entry.replace('sap-', ''),
          'SKILL.md'
        );

        let version: string | undefined;

        // Try to extract version from skills/*/SKILL.md frontmatter
        if (fs.existsSync(skillMdPath)) {
          try {
            const content = fs.readFileSync(skillMdPath, 'utf-8');
            const match = content.match(/version:\s*(.+?)[\n\r]/);
            if (match) {
              version = match[1].trim();
            }
          } catch (error) {
            // Ignore parse errors
          }
        }

        const pluginName = entry; // e.g., "sap-fi", "sap-mm", etc.
        const item = new PluginTreeItem(
          pluginName,
          fs.existsSync(skillMdPath) ? skillMdPath : null,
          version
        );
        this.pluginsCache.push(item);
      }

      // Sort alphabetically
      this.pluginsCache.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error loading plugins:', error);
    }
  }

  getTreeItem(element: PluginTreeItem): PluginTreeItem {
    return element;
  }

  async getChildren(): Promise<PluginTreeItem[]> {
    return this.pluginsCache;
  }

  getParent(): vscode.TreeItem | undefined {
    return undefined;
  }
}
