import * as vscode from 'vscode';
import { FlowMoEditorProvider } from './FlowMoEditorProvider.js';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    FlowMoEditorProvider.register(context)
  );
}

export function deactivate(): void {
  // nothing to dispose
}
