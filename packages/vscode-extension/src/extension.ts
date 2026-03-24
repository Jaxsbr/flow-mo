import * as vscode from 'vscode';
import { FlowMoEditorProvider } from './FlowMoEditorProvider.js';

const FLOW_TEMPLATE = `# flow-mo diagram (version must be 1)
#
# nodes[].data:
#   label (required), shape: rectangle | circle | diamond (default rectangle)
#   optional: width, height, background, border_color, border_width
#
# edges:
#   id, source, target (node ids)
#   optional: label
#   marker_start, marker_end: none | arrow (defaults: none at start, arrow at end)
#   midpoint: red | green (optional; filled circle on the line; omit for none)
version: 1
nodes: []
edges: []
`;

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    FlowMoEditorProvider.register(context)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('flowMo.openDiagram', () => {
      const uri = vscode.window.activeTextEditor?.document.uri;
      if (uri) {
        vscode.commands.executeCommand('vscode.openWith', uri, 'flowMo.flowYaml');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('flowMo.openSource', () => {
      const uri = vscode.window.tabGroups.activeTabGroup.activeTab?.input;
      if (uri && typeof uri === 'object' && 'uri' in uri) {
        vscode.commands.executeCommand('vscode.openWith', (uri as { uri: vscode.Uri }).uri, 'default');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('flowMo.newFlow', async (folderUri?: vscode.Uri) => {
      const targetDir = folderUri
        ?? vscode.workspace.workspaceFolders?.[0]?.uri;

      if (!targetDir) {
        vscode.window.showErrorMessage('No workspace folder open. Open a folder first.');
        return;
      }

      const baseName = 'new-flow';
      const ext = '.flow.yaml';
      let fileName = `${baseName}${ext}`;
      let counter = 1;

      // Auto-increment filename if it already exists
      while (true) {
        const fileUri = vscode.Uri.joinPath(targetDir, fileName);
        try {
          await vscode.workspace.fs.stat(fileUri);
          // File exists, increment
          counter++;
          fileName = `${baseName}-${counter}${ext}`;
        } catch {
          // File does not exist — use this name
          break;
        }
      }

      const fileUri = vscode.Uri.joinPath(targetDir, fileName);
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(FLOW_TEMPLATE, 'utf-8'));
      await vscode.commands.executeCommand('vscode.openWith', fileUri, 'flowMo.flowYaml');
    })
  );
}

export function deactivate(): void {
  // nothing to dispose
}
