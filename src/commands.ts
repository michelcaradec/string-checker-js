import * as vscode from 'vscode';
import * as path from 'path';
import { TreeProvider } from './tree/treeProvider';
import { TextTokenCollection } from './parser/textTokenCollection';
import { TextParser } from './parser/textParser';
import { ProviderCollectionFactory } from './checker/providerCollectionFactory';
import { ConfidenceLevel, DictionaryType, TreeViewType } from './enumerations';
import { UserDictionaryPersist } from './user-dictionary/userDictionaryPersist';
import { TreeItemToken } from './tree/tree-items/treeItemToken';
import { TreeItemFile } from './tree/tree-items/treeItemFile';
import { Messages, Constants, LanguageId } from './constants';
import { Files } from './helpers/files';
import { confidenceLevelToString, removeSentenceQuotes, sleep } from './helpers/utils';
import { ItemRegex } from './user-dictionary/dictionary-items/itemRegex';

export class Commands {
    //#region scanDocument

    static async scanDocumentWorkspace(
        tree: TreeProvider,
        includeAll?: boolean | false
    ): Promise<void> {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showInformationMessage(Messages.NoFolderWorkspaceOpened);
            return;
        }

        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: Messages.WorkspaceScanInProgress
            },
            async (progress, _token) => {
                this.scanStarted(tree);

                let files: string[] = [];
                for (const workspaceFolder of vscode.workspace.workspaceFolders!) {
                    files = await Files.getFiles(workspaceFolder.uri.fsPath);
                }

                if (files.length > 0) {
                    for (const filename of files) {
                        const doc = await vscode.workspace.openTextDocument(filename);
                        this.scanDocumentRaw(
                            tree,
                            doc,
                            includeAll,
                            true,
                            () => progress.report({ message: path.basename(filename) })
                        );
                    }

                    await this.scanCompleted(tree, progress, includeAll);
                } else {
                    vscode.window.showInformationMessage(Messages.NoFileFound);
                }
            }
        );
    }

    static async scanDocument(
        tree: TreeProvider,
        doc: vscode.TextDocument,
        includeAll?: boolean | false): Promise<void> {
        // Document language must be checked at execution-time to allow command trigger from tree view.
        // The following command enablement will lead to disabling it from tree view:
        // "enablement": "editorLangId == typescript || editorLangId == typescriptreact || editorLangId == javascript || editorLangId == javascriptreact",
        // https://code.visualstudio.com/docs/getstarted/keybindings#_when-clause-contexts
        if (doc.languageId === LanguageId.TypeScript
            || doc.languageId === LanguageId.TypeScriptReact
            || doc.languageId === LanguageId.JavaScript
            || doc.languageId === LanguageId.JavaScriptReact) {
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: Messages.DocumentScanInProgress
                },
                async (progress, _token) => {
                    this.scanStarted(tree);
                    this.scanDocumentRaw(tree, doc, includeAll, false, () => progress.report({}));
                    await this.scanCompleted(tree, progress, includeAll);
                }
            );
        } else {
            vscode.window.showWarningMessage(Messages.LanguageNotSupported);
        }
    }

    private static scanDocumentRaw(
        tree: TreeProvider,
        doc: vscode.TextDocument,
        includeAll?: boolean | false,
        append?: boolean | false,
        onProgress?: () => void | undefined): void {
        const text = doc.getText();
        if (onProgress) { onProgress(); }

        const tokens = this.scanDocumentImpl(text, includeAll, onProgress);

        tree.feed([[doc.uri, tokens]], append);
        if (onProgress) { onProgress(); }
    }

    /**
     * Scan some text for strings
     * @param {*} text Text to scan
     */
    private static scanDocumentImpl(
        text: string,
        includeAll?: boolean | false,
        onProgress?: () => void | undefined): TextTokenCollection {
        let items: TextTokenCollection = new TextTokenCollection();

        if (text === undefined || text === '') {
            return items;
        }

        const parser = new TextParser(
            text,
            vscode.workspace.getConfiguration(Constants.ExtensionID).get<boolean>('parser.jquery-exclude')!,
            vscode.workspace.getConfiguration(Constants.ExtensionID).get<string>('parser.jquery-identifier')
            );
        const providers = includeAll ? ProviderCollectionFactory.createIncludeAll() : ProviderCollectionFactory.createInstance();

        while (true) {
            let token = parser.getNextToken();
            if (token === null) {
                break;
            }

            if (token.value !== '') {
                [token.provider, token.level, token.info] = providers.check(token.value);
                if (token.level === ConfidenceLevel.Message) {
                    items.push(token);
                }
            }

            if (onProgress) { onProgress(); }
        }

        return items;
    }

    private static scanStarted(tree: TreeProvider): void {
        tree.clear()
            .refresh()
            .lockRendering(true);
    }

    private static async scanCompleted(
        tree: TreeProvider,
        progress: vscode.Progress<{ message?: string; increment?: number }>,
        includeAll: boolean = false): Promise<void> {
        // When all strings are returned, Token to Files view is prefered.
        if (includeAll) {
            tree.switchView(TreeViewType.TokenToFiles);
        }
        tree.lockRendering(false)
            .resetFilter()
            .refresh();
        if (!tree.getFirstItem()) {
            progress.report({ message: Messages.ScanNoTokenFound });
        } else {
            progress.report({ message: Messages.ScanCompleted });
        }

        await sleep(2000);
    }

    //#endregion

    static selectToken(uri: vscode.Uri, positions: [number, number][]): void {
        vscode.workspace.openTextDocument(uri).then(doc => {
            vscode.window.showTextDocument(doc).then(editor => {
                // Prepare token(s) selection
                let selections: vscode.Selection[] = [];
                for (const position of positions) {
                    const anchor = editor.document.positionAt(position[0]);
                    const active = editor.document.positionAt(position[1]);
                    selections.push(new vscode.Selection(anchor, active));
                }

                editor.selections = selections;
                editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenterIfOutsideViewport);	
            });
        });
    }

    static excludeParentFolder(node: vscode.TreeItem, nameOnly: boolean): void {
        if (!(node instanceof TreeItemFile)) {
            return;
        }

        UserDictionaryPersist.add(DictionaryType.ExcludeFolder, () => {
            const fullPath = path.parse((<TreeItemFile>node).uri.fsPath).dir;
            
            return nameOnly ? ItemRegex.fromValue(`\\${path.sep}${path.basename(fullPath)}$`).rawValue : fullPath;
        });
    }

    static excludeFile(node: vscode.TreeItem, nameOnly: boolean): void {
        if (!(node instanceof TreeItemFile)) {
            return;
        }

        UserDictionaryPersist.add(DictionaryType.ExcludeFile, () => nameOnly ? ItemRegex.fromValue(`\\${path.sep}${path.basename((<TreeItemFile>node).uri.fsPath)}$`).rawValue : (<TreeItemFile>node).uri.fsPath);
    }

    static addTokenDictionary(type: DictionaryType, node: vscode.TreeItem): void {
        if (!(node instanceof TreeItemToken) || node.label === undefined || node.label! === '') {
            return;
        }

        UserDictionaryPersist.add(type, () => node.label!);
    }

    static async filterTokens(tree: TreeProvider): Promise<void> {
        // FIXME: Make filter command icon reflect filtered state.
        const text = await vscode.window.showInputBox({ value: tree.filter, prompt: Messages.FilterToken, placeHolder: Messages.EnterString });
        if (text === undefined) {
            return;
        }
        
        if (text === '') {
            tree.resetFilter().refresh();
            return;
        }

        tree.setFilter(text).switchView(TreeViewType.TokenToFiles).refresh();
    }

    static async testString(): Promise<void> {
        let input: string | undefined = undefined;
        if (vscode.window.activeTextEditor) {
            const doc = vscode.window.activeTextEditor!.document;
            input = doc.getText(vscode.window.activeTextEditor!.selection);
        }

        const text = removeSentenceQuotes(
            await vscode.window.showInputBox({ prompt: Messages.TestString, value: input, placeHolder: Messages.EnterString })
        );
        if (text === undefined || text === '') {
            return;
        }

        const providers = ProviderCollectionFactory.createInstance();
        const [winner,,] = providers.check(text!);
        // QuickPick is not the best way to display items, but it's the most convenient one.
        vscode.window.showQuickPick(
            providers
                .test(text!)
                .map(([provider, result, message]) => `${provider!.name}: ${confidenceLevelToString(result)}` + (message === '' ? '' : ` (${message})${provider === winner ? ' *' : ''}`)),
            { placeHolder: Messages.PressEscapeToExit }
        );
    }

    static showVersion(): void {
        vscode.window.showInformationMessage(`${Constants.ExtensionName} ${Constants.ExtensionVersion}`);
    }
}
