import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { UserDictionary } from '../user-dictionary/userDictionary';
import { Constants, Messages } from '../constants';
import { UserDictionaryFactory } from '../user-dictionary/userDictionaryFactory';
import { DictionaryType, StatsEventType } from '../enumerations';
import { IStatsEmiter } from "../stats/statsEmiter";

export class Files {
    private _statsEmiter: IStatsEmiter;
    private _excludeFolders: UserDictionary
        = UserDictionaryFactory.mergeConfiguration(
        DictionaryType.ExcludeFolder,
        UserDictionaryFactory.createInstance(DictionaryType.ExcludeFolder, false)!);
    private _excludeFiles: UserDictionary
        = UserDictionaryFactory.mergeConfiguration(
        DictionaryType.ExcludeFile,
        UserDictionaryFactory.createInstance(DictionaryType.ExcludeFile, false)!);
    private _extensionsInclude: string[]
        = vscode.workspace.getConfiguration(Constants.ExtensionID).get<string[]>('file-extension') || [];
    private _extensionsExclude: string[]
        = vscode.workspace.getConfiguration(Constants.ExtensionID).get<string[]>('file-extension-exclude') || [];
    private _maxFiles: number
        = vscode.workspace.getConfiguration(Constants.ExtensionID).get<number>('workspace.file-max')!;

    constructor(statsEmiter: IStatsEmiter) {
        this._statsEmiter = statsEmiter;
    }

    async getFiles(folder: string, notify?: boolean | true): Promise<string[]> {
        const files = await this.getFilesImpl(folder);
        if (files.length === this._maxFiles && notify) {
            vscode.window.showWarningMessage(Messages.MaxFileLimitReached);
        }

        return files;
    }

    private async getFilesImpl(folder: string, files: string[] = []): Promise<string[]> {
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
                this._statsEmiter.emit(StatsEventType.FolderScanned);

                if (this._excludeFolders.contains(fullPath)) {
                    this._statsEmiter.emit(StatsEventType.FolderExcluded);
                    continue;
                }
                files = await this.getFilesImpl(fullPath, files);
                continue;
            } else {
                this._statsEmiter.emit(StatsEventType.FileScanned);

                if (this._excludeFiles.contains(fullPath)) {
                    this._statsEmiter.emit(StatsEventType.FileExcluded);
                    continue;
                }
            }

            // `path.extname()`is not used to support multiple dot extensions such as `*.d.ts`.
            if (this._extensionsExclude.some(ext => filename.endsWith(ext))) {
                this._statsEmiter.emit(StatsEventType.FileExcluded);
                continue;
            }

            if (this._extensionsInclude.length > 0
                && !this._extensionsInclude.some(ext => filename.endsWith(ext))) {
                this._statsEmiter.emit(StatsEventType.FileExcluded);
                continue;
            }

            this._statsEmiter.emit(StatsEventType.FileSelected);
            files.push(fullPath);
        }

        return files;
    }
}
