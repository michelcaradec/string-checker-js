import * as vscode from 'vscode';
import { TreeProvider } from './tree/treeProvider';
import { Commands } from './commands';
import { DictionaryType } from './enumerations';

export function activate(context: vscode.ExtensionContext) {
	const tree = new TreeProvider();
	const treeView = vscode.window.createTreeView('string-checker-js-view', { treeDataProvider: tree});

	context.subscriptions.push(
		vscode.window.registerTreeDataProvider('string-checker-js-view', tree),
		treeView,
		vscode.commands.registerTextEditorCommand(
			'string.checker.js.scanDocument',
			async (editor) => {
				await Commands.scanDocument(tree, editor.document);
				focusFirstItem();
			}
		),
		vscode.commands.registerTextEditorCommand(
			'string.checker.js.scanDocumentIncludeAll',
			async (editor) => {
				await Commands.scanDocument(tree, editor.document, true);
				focusFirstItem();
			}
		),
		vscode.commands.registerCommand(
			'string.checker.js.scanDocumentWorkspace',
			async () => Commands.scanDocumentWorkspace(tree)
		),
		vscode.commands.registerCommand(
			'string.checker.js.scanDocumentWorkspaceIncludeAll',
			async () => Commands.scanDocumentWorkspace(tree, true)
		),
		vscode.commands.registerCommand('string.checker.js.selectTreeItem', Commands.selectToken),
		vscode.commands.registerCommand('string.checker.js.excludeParentFolderPath', (node) => Commands.excludeParentFolder(node, false)),
		vscode.commands.registerCommand('string.checker.js.excludeParentFolderName', (node) => Commands.excludeParentFolder(node, true)),
		vscode.commands.registerCommand('string.checker.js.excludeFilePath', (node) => Commands.excludeFile(node, false)),
		vscode.commands.registerCommand('string.checker.js.excludeFileName', (node) => Commands.excludeFile(node, true)),
		vscode.commands.registerCommand('string.checker.js.includeToken', (node) => Commands.addTokenDictionary(DictionaryType.IncludeToken, node)),
		vscode.commands.registerCommand('string.checker.js.excludeToken', (node) => Commands.addTokenDictionary(DictionaryType.ExcludeToken, node)),
		vscode.commands.registerCommand('string.checker.js.switchView', () => tree.switchView().refresh()),
		vscode.commands.registerCommand('string.checker.js.filterTokens', () => Commands.filterTokens(tree)),
		vscode.commands.registerCommand('string.checker.js.testString', Commands.testString),
		vscode.commands.registerCommand('string.checker.js.showVersion', Commands.showVersion)
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
