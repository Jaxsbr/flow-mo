import * as vscode from 'vscode';

export class FlowMoEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = 'flowMo.flowYaml';

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.window.registerCustomEditorProvider(
      FlowMoEditorProvider.viewType,
      new FlowMoEditorProvider(context),
      {
        webviewOptions: { retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: false,
      }
    );
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'media'),
        vscode.Uri.joinPath(this.context.extensionUri, 'out'),
      ],
    };

    const disposables: vscode.Disposable[] = [];

    // Send document text to webview when it's ready
    const updateWebview = () => {
      webviewPanel.webview.postMessage({
        type: 'update',
        text: document.getText(),
      });
    };

    // Listen for messages from webview
    disposables.push(
      webviewPanel.webview.onDidReceiveMessage((message: { type: string; text?: string }) => {
        switch (message.type) {
          case 'ready':
            updateWebview();
            return;
          case 'edit':
            if (typeof message.text === 'string') {
              const edit = new vscode.WorkspaceEdit();
              edit.replace(
                document.uri,
                new vscode.Range(0, 0, document.lineCount, 0),
                message.text
              );
              vscode.workspace.applyEdit(edit);
            }
            return;
        }
      })
    );

    // Listen for document changes (external edits)
    disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document.uri.toString() === document.uri.toString() && e.contentChanges.length > 0) {
          updateWebview();
        }
      })
    );

    // Clean up on dispose
    webviewPanel.onDidDispose(() => {
      for (const d of disposables) {
        d.dispose();
      }
    });

    // Set initial HTML
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();

    // Placeholder HTML — US-F4 will replace with the bundled React app
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${webview.cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlowMo</title>
  <style nonce="${nonce}">
    body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-foreground); }
    .placeholder { text-align: center; margin-top: 40px; opacity: 0.7; }
  </style>
</head>
<body>
  <div class="placeholder">
    <h2>FlowMo Diagram Editor</h2>
    <p>Custom editor registered. Webview UI loading…</p>
    <p id="status">Waiting for document…</p>
  </div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    vscode.postMessage({ type: 'ready' });
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'update') {
        document.getElementById('status').textContent =
          'Document loaded (' + message.text.length + ' chars)';
      }
    });
  </script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
