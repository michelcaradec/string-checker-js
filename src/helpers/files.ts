import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { UserDictionary } from '../user-dictionary/userDictionary';
import { Constants, Messages } from '../constants';
import { UserDictionaryFactory } from '../user-dictionary/userDictionaryFactory';
import { DictionaryType } from '../enumerations';

export class Files {
    private static _excludeFolders: UserDictionary;
    private static _excludeFiles: UserDictionary;
    private static _extensions: Set<string>;
    private static _maxFiles: number;

    private static syncConfiguration(): void {
        this._excludeFolders = UserDictionaryFactory.mergeConfiguration(
            DictionaryType.ExcludeFolder,
            UserDictionaryFactory.createInstance(DictionaryType.ExcludeFolder, false)!);
        this._excludeFiles = UserDictionaryFactory.mergeConfiguration(
            DictionaryType.ExcludeFile,
            UserDictionaryFactory.createInstance(DictionaryType.ExcludeFile, false)!);
        this._extensions = new Set<string>(vscode.workspace.getConfiguration(Constants.ExtensionID).get<string[]>('file-extension')!);
        this._maxFiles = vscode.workspace.getConfiguration(Constants.ExtensionID).get<number>('workspace.file-max')!;
    }

    static async getFiles(folder: string, notify?: boolean | true): Promise<string[]> {
        this.syncConfiguration();

        const files = await this.getFilesImpl(folder);
        if (files.length === this._maxFiles && notify) {
            vscode.window.showWarningMessage(Messages.MaxFileLimitReached);
        }

        return files;
    }

    private static async getFilesImpl(folder: string, files: string[] = []): Promise<string[]> {
        if (files.length >= this._maxFiles) {
            return files;
        }

        const filenames = await new Promise<string[]>((resolve, reject) => {
            fs.readdir(folder, function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });

        for (const filename of filenames.filter(f => !f.startsWith('.'))) {
            if (files.length >= this._maxFiles) {
                break;
            }

            const fullPath = path.join(folder, filename);

            const stat = await new Promise<fs.Stats>((resolve, reject) => {
                fs.stat(fullPath, function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    resolve(data);
                });
            });

            if (stat.isDirectory()) {
                if (this._excludeFolders.contains(fullPath)) {
                    continue;
                }
                files = await this.getFilesImpl(fullPath, files);
                continue;
            } else {
                if (this._excludeFiles.contains(fullPath)) {
                    continue;
                }
            }

            const ext = path.extname(filename);
            if (!this._extensions.has(ext)) {
                continue;
            }

            files.push(fullPath);
        }

        return files;
    }
}
