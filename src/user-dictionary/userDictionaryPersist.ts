import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { UserDictionary } from './userDictionary';
import { DictionaryType } from '../enumerations';
import { Constants } from '../constants';
import { UserDictionaryItemFactory } from './dictionary-items/userDictionaryItemFactory';
import { UserDictionaryFactory } from './userDictionaryFactory';

export class UserDictionaryPersist {
    static get canPersist(): boolean {
        return vscode.workspace.workspaceFolders ? true : false;
    }

    private static getFilename(type: DictionaryType): string | undefined {
        if (!this.canPersist) {
            return undefined;
        }

        let typeName: string;
        switch (type) {
            case DictionaryType.ExcludeToken:
                typeName = 'token.exclude';
                break;

            case DictionaryType.IncludeToken:
                typeName = 'token.include';
                break;

            case DictionaryType.ExcludeFile:
                typeName = 'file.exclude';
                break;

            case DictionaryType.ExcludeFolder:
                typeName = 'folder.exclude';
                break;

            default:
                throw new Error(`Not supported dictionary type ${type}`);
        }

        const rootPath = vscode.workspace.workspaceFolders![0].uri.fsPath.toString();
        const filename = path.join(rootPath, '.vscode', `${Constants.ExtensionID}-${typeName}.dict`);

        return filename;
    }

    static read(type: DictionaryType, dict: UserDictionary): UserDictionary {
        if (!this.canPersist) {
            throw new Error('User dictionary persistence is not supported.');
        }

        const filename = this.getFilename(type)!;

        try {
            fs.accessSync(filename);

            const content = fs.readFileSync(filename).toString('utf8');
            for (const value of content.split('\n')) {
                if (value.trim() !== '') {
                    dict.add(UserDictionaryItemFactory.createInstance(value));
                }
            }
        } catch {}

        return dict;
    }

    static write(type: DictionaryType, dict: UserDictionary): void {
        if (!this.canPersist) {
            throw new Error('User dictionary persistence is not supported.');
        }

        try {
            const filename = this.getFilename(type)!;
            const pathname = path.dirname(filename);
            if (!fs.existsSync(pathname)) {
                fs.mkdirSync(pathname);
            }

            const writer = fs.createWriteStream(filename, { encoding: 'utf8' });
            dict.forEach(it => {
                writer.write(it.rawValue);
                writer.write('\n');
            });

            writer.end();
        } catch {}
    }

    static add(type: DictionaryType, getValue: () => string): void {
        const dict = UserDictionaryFactory.createInstance(type);
        if (dict) {
            const value = getValue();
            if (!dict.contains(value)) {
                dict.add(UserDictionaryItemFactory.createInstance(value));
                UserDictionaryPersist.write(type, dict);
            }
        }
    }
}
