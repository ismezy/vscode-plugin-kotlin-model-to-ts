// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "kotlin-model-to-typescript" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('extension.kotlinModelToTypescript', async () => {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    // if (vscode.window.activeTextEditor) {
    var kt = await vscode.env.clipboard.readText();
    kt = kt.replace(/\r?\n/g, ' ');
    const typeMap: { [key: string]: string } = { 'String': 'string', 'Int': 'number', 'Double': 'number', 'Float': 'number' };
    if (!kt) {
      vscode.window.showWarningMessage('剪贴板无内容！');
    }
    console.log('--------------------');
    try {
      const classDefine = kt.match(/class\s+[^{}]*{/)![0];
      const classNames = classDefine.match(/\w+(<\w+>)?/g);
      const className = classNames![1];
      const intefaces = classNames!.slice(2);
      const vars = kt.match(/var\s+\w+\s*:\s*\w+/g);
      console.log({ className, intefaces, vars });
      var tsClass = `\nexport interface ${className}`;
      if (intefaces.length > 0) {
        tsClass = `${tsClass} extends ${intefaces.join(', ')}`;
      }
      tsClass += '{\n';
      if (vars) {
        tsClass += vars.map(item => {
          var result = item.replace(/var\s+/g, '')
            .replace(/:/, '?:');
          Object.keys(typeMap).forEach(key => {
            result = result.replace(new RegExp(`:\s*${key}/`), `: ${typeMap[key]}`);
          });
          return result;
        }).join('\n');
      }
      tsClass += "\n}";
    } catch (e) {
      vscode.window.showWarningMessage('剪贴板内容未包含kotlin模型类！');
    }
    if (vscode.window.activeTextEditor) {
      vscode.window.activeTextEditor!.edit(editBuilder => {
        const last = new vscode.Position(vscode.window.activeTextEditor!.document.lineCount + 1, 0);
        editBuilder.insert(last, tsClass);
      });
    } else {
      vscode.window.showInformationMessage('请先选择一个ts文件。');
    }
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
