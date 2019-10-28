import * as vscode from 'vscode';
import * as path from 'path';
import { Messages } from '../../constants';

export class TreeItemFile extends vscode.TreeItem {
    /**
     * URI of file.
     */
    uri: vscode.Uri;

    contextValue = 'item-file';

    private constructor(uri: vscode.Uri) {
        super(path.basename(uri.fsPath));

        this.uri = uri;
    }

    /**
     * Create a File to Tokens instance
     * @param uri URI of file
     */
    static CreateF2TInstance(uri: vscode.Uri): TreeItemFile {
        const instance = new TreeItemFile(uri);

        instance.uri = uri;
        instance.tooltip = uri.fsPath;

        return instance;
    }

    /**
     * Create a Token to Files instance
     * @param uri URI of file
     * @param positions Position of parent token in file
     */
    static CreateT2FInstance(uri: vscode.Uri, positions: [number, number][] | []): TreeItemFile {
        const instance = new TreeItemFile(uri);

        instance.uri = uri;
        instance.tooltip = `${uri.fsPath} (${positions.length})`;
        instance.command = {
            command: 'string.checker.js.selectTreeItem',
            title: Messages.SelectToken,
            arguments: [uri, positions]
        };

        return instance;
    }
}
