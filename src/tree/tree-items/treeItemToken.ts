import * as vscode from 'vscode';
import { TextToken } from "../../parser/textToken";
import { TreeItemFile } from './treeItemFile';
import { Messages } from '../../constants';

export class TreeItemToken extends vscode.TreeItem {
    /**
     * Parent file.
     */
    file?: TreeItemFile;
    /**
     * Text token found in parent file
     * (used in File to Tokens view).
     */
    token?: TextToken;

    contextValue = 'item-token';

    private constructor(label: string) {
        super(label.replace(/[\n\r]/g, ''));
    }

    /**
     * Create a File to Tokens instance
     * @param token Text token found in parent file
     * @param file Parent file
     */
    static CreateF2TInstance(token: TextToken, file: TreeItemFile): TreeItemToken {
        const instance = new TreeItemToken(token.value);

        instance.file = file;
        instance.token = token;
        instance.description = token.info;
        instance.tooltip = `${token.provider!.name} (${token.positions.length})`;
        instance.command = {
            command: 'string.checker.js.selectTreeItem',
            title: Messages.SelectToken,
            arguments: [file.uri, token.positions]
        };

        return instance;
    }

    /**
     * Create a Token to Files instance
     * @param token Token
     */
    static CreateT2FInstance(token: TreeItemToken): TreeItemToken {
        const instance = new TreeItemToken(token.label!);

        instance.description = token.description;
        instance.tooltip = `${token.token!.provider!.name}`;

        return instance;
    }
}
