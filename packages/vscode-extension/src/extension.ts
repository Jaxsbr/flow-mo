import * as vscode from 'vscode';
import { FlowMoEditorProvider } from './FlowMoEditorProvider.js';

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
}

export function deactivate(): void {
  // nothing to dispose
}
