import * as vscode from 'vscode';
import { TreeProvider } from './tree/treeProvider';
import { Commands } from './commands';
import { DictionaryType } from './enumerations';

export function activate(context: vscode.ExtensionContext) {
	const tree = new TreeProvider();
	const treeView = vscode.window.createTreeView('string-checker-js-view', { treeDataProvider: tree});
	const commands = new Commands(tree);

	context.subscriptions.push(
		vscode.window.registerTreeDataProvider('string-checker-js-view', tree),
		treeView,
		vscode.commands.registerTextEditorCommand(
			'string.checker.js.scanDocument',
			async (editor) => {
				await commands.scanDocument(editor.document);
				focusFirstItem();
			}
		),
		vscode.commands.registerTextEditorCommand(
			'string.checker.js.scanDocumentIncludeAll',
			async (editor) => {
				await commands.scanDocument(editor.document, true);
				focusFirstItem();
			}
		),
		vscode.commands.registerCommand(
			'string.checker.js.scanDocumentWorkspace',
			async () => commands.scanDocumentWorkspace()
		),
		vscode.commands.registerCommand(
			'string.checker.js.scanDocumentWorkspaceIncludeAll',
			async () => commands.scanDocumentWorkspace(true)
		),
		vscode.commands.registerCommand('string.checker.js.selectTreeItem', commands.selectToken),
		vscode.commands.registerCommand('string.checker.js.excludeParentFolderPath', (node) => commands.excludeParentFolder(node, false)),
		vscode.commands.registerCommand('string.checker.js.excludeParentFolderName', (node) => commands.excludeParentFolder(node, true)),
		vscode.commands.registerCommand('string.checker.js.excludeFilePath', (node) => commands.excludeFile(node, false)),
		vscode.commands.registerCommand('string.checker.js.excludeFileName', (node) => commands.excludeFile(node, true)),
		vscode.commands.registerCommand('string.checker.js.includeToken', (node) => commands.addTokenDictionary(DictionaryType.IncludeToken, node)),
		vscode.commands.registerCommand('string.checker.js.excludeToken', (node) => commands.addTokenDictionary(DictionaryType.ExcludeToken, node)),
		vscode.commands.registerCommand('string.checker.js.switchView', () => tree.switchView().refresh()),
		vscode.commands.registerCommand('string.checker.js.filterTokens', () => commands.filterTokens(tree)),
		vscode.commands.registerCommand('string.checker.js.testString', commands.testString),
		vscode.commands.registerCommand('string.checker.js.showVersion', commands.showVersion)
	);

	function focusFirstItem() {
		const item = tree.getFirstItem();
		if (item !== undefined) {
			treeView.reveal(item);
		}	
	}
}

export function deactivate() {
}
