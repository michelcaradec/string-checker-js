import * as vscode from 'vscode';
import { IStatsEmiter } from "./statsEmiter";
import { StatsEventType } from "../enumerations";
import { statsEventTypeToString } from '../helpers/converters';
import { Constants, ProviderName, Stats } from '../constants';
import { getTimeSpanHumanReadable } from '../helpers/utils';

export class StatsProvider implements IStatsEmiter {
    private _events: Map<StatsEventType, number> = new Map<StatsEventType, number>();
    private _channel: vscode.OutputChannel = vscode.window.createOutputChannel(Constants.ExtensionNameHumanReadable);
    private _dateStart: Date | undefined;

    reset(): void {
        this._events.clear();
        this._channel.clear();

        this._dateStart = new Date();
        this._channel.appendLine(`${Stats.Scan_Started}: ${this._dateStart!.toLocaleString()}`);
        this._channel.appendLine('');
    }

    dumpPretty(): void {
        //#region File System

        this._channel.appendLine(Stats.FileSystem_Title);
        this._channel.appendLine(`${Stats.FileSystem_FoldersPicked}: ${(this._events.get(StatsEventType.FolderScanned) || 0) - (this._events.get(StatsEventType.FolderExcluded) || 0)} / ${this._events.get(StatsEventType.FolderScanned) || 0}.`);
        this._channel.appendLine(`${Stats.FileSystem_FilesPicked}: ${this._events.get(StatsEventType.FileSelected) || 0} / ${this._events.get(StatsEventType.FileScanned) || 0}.`);
        this._channel.appendLine('');

        //#endregion
        //#region Parser

        this._channel.appendLine(Stats.Parser_Title);
        for (const event of [StatsEventType.ParserStatementThrowIgnored, StatsEventType.ParserStatementJQueryIgnored, StatsEventType.ParserStatementConsoleIgnored]) {
            this._channel.appendLine(`${statsEventTypeToString(event)}: ${this._events.get(event) || 0}`);
        }
        this._channel.appendLine('');

        //#endregion
        //#region Providers

        const headerLine = '-';
        const padProvider = 30;
        const padTechnical = 15;
        const padMessage = 15;
        const line = `${headerLine.repeat(padProvider)}|${headerLine.repeat(1 + padTechnical)}|${headerLine.repeat(1 + padMessage)}`;

        this._channel.appendLine(Stats.Providers_Title);
        this._channel.appendLine(`${Stats.Providers_Header_Provider.padEnd(padProvider)}| ${Stats.Providers_Header_Technical.padEnd(padTechnical)}| ${Stats.Providers_Header_Message.padEnd(padMessage)}`);
        this._channel.appendLine(line);
        for (const [name, eventTechnical, eventMessage] of
                            [[ProviderName.ClassName, StatsEventType.DetectedAsTechnicalByClassName, StatsEventType.DetectedAsMessageByClassName],
                            [ProviderName.Code, StatsEventType.DetectedAsTechnicalByCode, StatsEventType.DetectedAsMessageByCode],
                            [ProviderName.Entropy, StatsEventType.DetectedAsTechnicalByEntropy, StatsEventType.DetectedAsMessageByEntropy],
                            [ProviderName.Keywords, StatsEventType.DetectedAsTechnicalByKeyword, StatsEventType.DetectedAsMessageByKeyword],
                            [ProviderName.Language, StatsEventType.DetectedAsTechnicalByLanguage, StatsEventType.DetectedAsMessageByLanguage],
                            [ProviderName.String, StatsEventType.DetectedAsTechnicalByString, StatsEventType.DetectedAsMessageByString]]) {
            const countTechnical = (this._events.get(<StatsEventType>eventTechnical) || 0).toString().padStart(1 + padTechnical);
            const countMessage = (this._events.get(<StatsEventType>eventMessage) || 0).toString().padStart(1 + padMessage);
            this._channel.appendLine(`${(<string>name).padEnd(padProvider)}|${countTechnical}|${countMessage}`);
        }

        //#region Message strings ratio

        const totalTokens = this._events.get(StatsEventType.ParserToken) || 0;
        if (totalTokens > 0) {
            const totalMessages
                = (this._events.get(StatsEventType.DetectedAsMessageByClassName) || 0)
                + (this._events.get(StatsEventType.DetectedAsMessageByCode) || 0)
                + (this._events.get(StatsEventType.DetectedAsMessageByEntropy) || 0)
                + (this._events.get(StatsEventType.DetectedAsMessageByKeyword) || 0)
                + (this._events.get(StatsEventType.DetectedAsMessageByLanguage) || 0)
                + (this._events.get(StatsEventType.DetectedAsMessageByString) || 0);
            this._channel.appendLine(line);
            this._channel.appendLine(`${''.padEnd(padProvider)}|${''.padEnd(1 + padTechnical)}|${(totalMessages / totalTokens * 100).toFixed(2).padStart(padMessage)}%`);
        }

        //#endregion

        this._channel.appendLine('');

        //#endregion    
        //#region Completion

        const dateEnd = new Date();
        this._channel.appendLine(`${Stats.Scan_Completed}: ${dateEnd.toLocaleString()} (${getTimeSpanHumanReadable(this._dateStart!, dateEnd)})`);
        this._channel.appendLine('');

        //#endregion

        if (vscode.workspace.getConfiguration(Constants.ExtensionID).get<boolean>('output.show-on-completion')!) {
            this._channel.show(true);
        }
    }

    dumpRaw(): void {
        // Show all metrics
        Array.from(this._events.keys())
        .sort((a, b) => a - b)
        .forEach(event => this._channel.appendLine(`${statsEventTypeToString(event)} = ${this._events.get(event)!}`));
    }

    //#region IStatsEmiter

    emit(event: StatsEventType, value: number = 1): void {
        if (!value) {
            return;
        }

        this._events.set(event, (this._events.get(event) || 0) + value!);
    }

    //#endregion
}
