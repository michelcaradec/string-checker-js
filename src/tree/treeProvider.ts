import * as vscode from 'vscode';
import { TextTokenCollection } from '../parser/textTokenCollection';
import { TreeItemToken } from './tree-items/treeItemToken';
import { TreeItemFile } from './tree-items/treeItemFile';
import { distinct } from '../helpers/utils';
import { TreeViewType } from '../enumerations';

export class TreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _viewType: TreeViewType = TreeViewType.FileToTokens;
    private _files: TreeItemFile[] = [];
    private _isRenderingLocked: boolean = false;

    //#region Tokens

    private _tokens: TreeItemToken[] = [];

    private get tokens(): TreeItemToken[] {
        if (this._filter && this._filter.length > 0) {
            const regex = new RegExp(this._filter!, 'i');
            return this._tokens.filter(it => it.label!.search(regex) >= 0);
        } else {
            return this._tokens;
        }
    }

    private set tokens(value: TreeItemToken[]) {
        this._tokens = value;
    }

    //#endregion

    // FIXME: call `dispose()` when TreeProvider is disposed.
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined>
        = new vscode.EventEmitter<vscode.TreeItem | undefined>();

    readonly onDidChangeTreeData?: vscode.Event<any> | undefined = this._onDidChangeTreeData.event;

    clear(): TreeProvider {
        this._files = [];
        this.tokens = [];
        this.resetFilter();

        return this;
    }
    
    feed(collections: [vscode.Uri, TextTokenCollection][], append?: boolean | false): TreeProvider {
        if (!append) {
            this.clear();
        }

        for (const [uri, tokens] of collections.filter(([_, tokens]) => tokens.items.length > 0)) {
            const file = TreeItemFile.CreateF2TInstance(uri);
            this._files.push(file);

            for (const item of tokens.items) {
                this.tokens.push(TreeItemToken.CreateF2TInstance(item, file));
            }
        }

        return this;
    }

    lockRendering(state: boolean): TreeProvider {
        this._isRenderingLocked = state;

        return this;
    }

    refresh(): TreeProvider {
        this._onDidChangeTreeData.fire();

        return this;
    }

    switchView(target?: TreeViewType): TreeProvider {
        if (target === undefined) {
            switch (this._viewType) {
                case TreeViewType.FileToTokens:
                    this._viewType = TreeViewType.TokenToFiles;
                    break;

                case TreeViewType.TokenToFiles:
                    this._viewType = TreeViewType.FileToTokens;
                    break;

                default:
                    throw new Error(`Not supported view type ${this._viewType}`);
            }
        }
        else {
            this._viewType = target!;
        }
        
        return this;
    }

    //#region Filter

    private _filter?: string;

    get filter(): string | undefined {
        return this._filter;
    }

    resetFilter(): TreeProvider {
        this._filter = undefined;

        return this;
    }

    setFilter(filter: string): TreeProvider {
        this._filter = filter;
        
        return this;
    }

    //#endregion
   
    getFirstItem(): vscode.TreeItem | undefined  {
        const tokens = this.tokens;
        return tokens.length > 0 ? (<TreeItemToken>tokens[0]).file : undefined;
    }

    getChildren(element?: any): vscode.ProviderResult<any[]> {
        if (this._isRenderingLocked) {
            return undefined;
        }

        switch (this._viewType) {
            case TreeViewType.FileToTokens:
                //#region File => Tokens

                // Use of original objects (such as created in `feed()` method).

                if (element instanceof TreeItemFile) {
                    // This file tokens
                    const file = (<TreeItemFile>element);
                    return this.tokens.filter(it => it.file!.uri === file.uri);
                } else if (element instanceof TreeItemToken) {
                    return undefined;
                } else if (this._files.length > 0) {
                    // Files
                    const sorted = this._files.sort((a, b) => a.label!.localeCompare(b.label!));

                    sorted.forEach(it => it.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed);
                    sorted[0].collapsibleState = vscode.TreeItemCollapsibleState.Expanded;

                    return sorted;
                } else {
                    return undefined;
                }

                //#endregion

            case TreeViewType.TokenToFiles:
                //#region Token => Files

                // Dynamic creation of new objects.

                if (element instanceof TreeItemToken) {
                    // This token files
                    const token = <TreeItemToken>element;
                    // Files where this token appears
                    return this.tokens.filter(it => it.label === token.label)
                        .map(it => TreeItemFile.CreateT2FInstance(it.file!.uri, it.token!.positions));
                } else if (element instanceof TreeItemFile) {
                    return undefined;
                } else if (this.tokens.length > 0) {
                    // Tokens
                    const sorted = distinct(this.tokens, (a, b) => a.label!.localeCompare(b.label!))
                        .map(it => TreeItemToken.CreateT2FInstance(it));

                    sorted.forEach(it => it.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed);
                    
                    return sorted;
                } else {
                    return undefined;
                }

                //#endregion

            default:
                throw new Error(`Not supported view type ${this._viewType}`);
        }
    }

    getTreeItem(element: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return <vscode.TreeItem>element;
    }

    getParent?(element: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem> {
        if (this._isRenderingLocked) {
            return undefined;
        }
        
        switch (this._viewType) {
            case TreeViewType.FileToTokens:
                return element instanceof TreeItemToken ? (<TreeItemToken>element).file : undefined;

            case TreeViewType.TokenToFiles:
                if (element instanceof TreeItemFile) {
                    const child = <TreeItemFile>element;
                    const parent = this.tokens.filter(it => it.file!.uri === child.uri)[0];
                    return parent;
                } else {
                    return undefined;
                }
        
            default:
                throw new Error(`Not supported view type ${this._viewType}`);
        }
    }
}
