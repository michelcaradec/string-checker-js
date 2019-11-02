import * as vscode from 'vscode';
import * as path from 'path';
import { UserDictionary } from "./userDictionary";
import { UserDictionaryPersist } from './userDictionaryPersist';
import { DictionaryType } from '../enumerations';
import { Messages, Constants } from '../constants';
import { ItemRegex } from './dictionary-items/itemRegex';

export class UserDictionaryFactory {
    private static _repositories: { [id: number]: UserDictionary | undefined } = {
        0: undefined,   // DictionaryType.IncludeToken
        1: undefined,   // DictionaryType.ExcludeToken
        2: undefined,   // DictionaryType.ExcludeFile
        3: undefined    // DictionaryType.ExcludeFolder
    };

    static createInstance(type: DictionaryType, notify?: boolean | true): UserDictionary | undefined {
        if (!UserDictionaryPersist.canPersist) {
            if (notify) {
                vscode.window.showInformationMessage(Messages.NoFolderWorkspaceOpened);
            }

            return undefined;
        }

        let dict = this._repositories[type];
        if (!dict) {
            dict = UserDictionaryPersist.read(type, new UserDictionary());
            this._repositories[type] = dict;
        } else {
            dict = this._repositories[type];
        }

        return dict;
    }

    /**
     * Merge user dictionary values with configuration ones.
     * @param type Type of dictionary
     * @param dict Dictionary to merge with
     * @returns Merged dictionary. A copy of the input dictionary is returned if configuration values were added. Otherwise the original dictionary is returned.
     */
    static mergeConfiguration(type: DictionaryType, dict: UserDictionary): UserDictionary {
        let merged: UserDictionary = dict;

        switch (type) {
            case DictionaryType.ExcludeFolder:
                const excludeFolders = new Set<string>(vscode.workspace.getConfiguration(Constants.ExtensionID).get<string[]>('folder-name-exclude')!);
                if (excludeFolders.size > 0) {
                    merged = new UserDictionary(dict);
                    excludeFolders.forEach(it => merged.add(ItemRegex.fromValue(`\\${path.sep}${ItemRegex.escape(it)}$`)));
                }
                break;
        }

        return merged;
    }
}
