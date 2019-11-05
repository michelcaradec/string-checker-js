import * as vscode from 'vscode';
import * as path from 'path';
import { TreeProvider } from './tree/treeProvider';
import { TextTokenCollection } from './parser/textTokenCollection';
import { TextParser } from './parser/textParser';
import { ProviderCollectionFactory } from './checker/providerCollectionFactory';
import { ConfidenceLevel, DictionaryType, TreeViewType, StatsEventType } from './enumerations';
import { UserDictionaryPersist } from './user-dictionary/userDictionaryPersist';
import { TreeItemToken } from './tree/tree-items/treeItemToken';
import { TreeItemFile } from './tree/tree-items/treeItemFile';
import { Messages, Constants, LanguageId } from './constants';
import { Files } from './helpers/files';
import { removeSentenceQuotes, sleep } from './helpers/utils';
import { confidenceLevelToString } from './helpers/converters';
import { ItemRegex } from './user-dictionary/dictionary-items/itemRegex';
import { StatsProvider } from './stats/statsProvider';

export class Commands {
    private _statsProvider = new StatsProvider();
    private _tree: TreeProvider;

    constructor(tree: TreeProvider) {
        this._tree = tree;
    }

    //#region scanDocument

    async scanDocumentWorkspace(includeAll?: boolean | false): Promise<void> {
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
                this.scanStarted();

                let files: string[] = [];
                for (const workspaceFolder of vscode.workspace.workspaceFolders!) {
                    files = await new Files(this._statsProvider).getFiles(workspaceFolder.uri.fsPath);
                }

                if (files.length > 0) {
                    for (const filename of files) {
                        const doc = await vscode.workspace.openTextDocument(filename);
                        this.scanDocumentRaw(
                            doc,
                            includeAll,
                            true,
                            () => progress.report({ message: path.basename(filename) })
                        );
                    }

                    await this.scanCompleted(progress, includeAll);
                } else {
                    vscode.window.showInformationMessage(Messages.NoFileFound);
                }
            }
        );
    }

    async scanDocument(
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
                    this.scanStarted();
                    this._statsProvider.emit(StatsEventType.FileScanned);
                    this._statsProvider.emit(StatsEventType.FileSelected);
                    this.scanDocumentRaw(doc, includeAll, false, () => progress.report({}));
                    await this.scanCompleted(progress, includeAll);
                }
            );
        } else {
            vscode.window.showWarningMessage(Messages.LanguageNotSupported);
        }
    }

    private scanDocumentRaw(
        doc: vscode.TextDocument,
        includeAll?: boolean | false,
        append?: boolean | false,
        onProgress?: () => void | undefined): void {
        const text = doc.getText();
        if (onProgress) { onProgress(); }

        const tokens = this.scanDocumentImpl(text, includeAll, onProgress);

        this._tree.feed([[doc.uri, tokens]], append);
        if (onProgress) { onProgress(); }
    }

    /**
     * Scan some text for strings
     * @param {*} text Text to scan
     */
    private scanDocumentImpl(
        text: string,
        includeAll?: boolean | false,
        onProgress?: () => void | undefined): TextTokenCollection {
        let items: TextTokenCollection = new TextTokenCollection();

        this._statsProvider.emit(StatsEventType.DocumentScanned);

        if (text === undefined || text === '') {
            return items;
        }

        const parser = new TextParser(
            this._statsProvider,
            text,
            vscode.workspace.getConfiguration(Constants.ExtensionID).get<boolean>('parser.jquery-exclude')!,
            vscode.workspace.getConfiguration(Constants.ExtensionID).get<string>('parser.jquery-identifier')
            );
        const providers
            = includeAll
            ? ProviderCollectionFactory.createIncludeAll(this._statsProvider)
            : ProviderCollectionFactory.createInstance(this._statsProvider);

        while (true) {
            const token = parser.getNextToken();
            if (token === null) {
                break;
            }

            [token.provider, token.level, token.info] = providers.check(token.value);
            if (token.level === ConfidenceLevel.Message) {
                items.push(token);
            }

            if (onProgress) { onProgress(); }
        }

        return items;
    }

    private scanStarted(): void {
        this._statsProvider.reset();
        this._tree.clear()
            .refresh()
            .lockRendering(true);
    }

    private async scanCompleted(
        progress: vscode.Progress<{ message?: string; increment?: number }>,
        includeAll: boolean = false): Promise<void> {
        // When all strings are returned, Token to Files view is prefered.
        if (includeAll) {
            this._tree.switchView(TreeViewType.TokenToFiles);
        }
        this._tree.lockRendering(false)
            .resetFilter()
            .refresh();
        if (!this._tree.getFirstItem()) {
            progress.report({ message: Messages.ScanNoTokenFound });
        } else {
            progress.report({ message: Messages.ScanCompleted });
        }

        this._statsProvider.dumpPretty();

        await sleep(2000);
    }

    //#endregion

    selectToken(uri: vscode.Uri, positions: [number, number][]): void {
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

    excludeParentFolder(node: vscode.TreeItem, nameOnly: boolean): void {
        if (!(node instanceof TreeItemFile)) {
            return;
        }

        UserDictionaryPersist.add(DictionaryType.ExcludeFolder, () => {
            const fullPath = path.parse((<TreeItemFile>node).uri.fsPath).dir;
            
            return nameOnly ? ItemRegex.fromValue(`\\${path.sep}${ItemRegex.escape(path.basename(fullPath))}$`).rawValue : fullPath;
        });
    }

    excludeFile(node: vscode.TreeItem, nameOnly: boolean): void {
        if (!(node instanceof TreeItemFile)) {
            return;
        }

        UserDictionaryPersist.add(
            DictionaryType.ExcludeFile,
            () =>
                nameOnly
                ? ItemRegex.fromValue(`\\${path.sep}${ItemRegex.escape(path.basename((<TreeItemFile>node).uri.fsPath))}$`).rawValue
                : (<TreeItemFile>node).uri.fsPath);
    }

    addTokenDictionary(type: DictionaryType, node: vscode.TreeItem): void {
        if (!(node instanceof TreeItemToken) || node.label === undefined || node.label! === '') {
            return;
        }

        UserDictionaryPersist.add(type, () => node.label!);
    }

    async filterTokens(tree: TreeProvider): Promise<void> {
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

    async testString(): Promise<void> {
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

        const providers = ProviderCollectionFactory.createInstance(this._statsProvider);
        const [winner,,] = providers.check(text!);
        // QuickPick is not the best way to display items, but it's the most convenient one.
        vscode.window.showQuickPick(
            providers
                .test(text!)
                .map(([provider, result, message]) => `${provider!.name}: ${confidenceLevelToString(result)}` + (message === '' ? '' : ` (${message})${provider === winner ? ' *' : ''}`)),
            { placeHolder: Messages.PressEscapeToExit }
        );
    }

    showVersion(): void {
        vscode.window.showInformationMessage(`${Constants.ExtensionName} ${Constants.ExtensionVersion}`);
    }
}
