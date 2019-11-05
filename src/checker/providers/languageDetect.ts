import * as vscode from 'vscode';
import { IDetectProvider } from "./detectProvider";
import { ConfidenceLevel, StatsEventType } from "../../enumerations";
import { Constants, ProviderName } from '../../constants';
var franc = require('franc');

const UndefinedLanguage: string = 'und';

export class LanguageDetect implements IDetectProvider {
    //#region IDetectProvider

    readonly name: string = ProviderName.Language;
    readonly eventWhenTechnical: StatsEventType = StatsEventType.DetectedAsTechnicalByLanguage;
    readonly eventWhenMessage: StatsEventType = StatsEventType.DetectedAsMessageByLanguage;
    readonly isStopOnEval: boolean = false;

    check(text: string): [ConfidenceLevel, string] {
        const filter = vscode.workspace.getConfiguration(Constants.ExtensionID).get<string[]>('language.languages-check')!;
        const languages: [[string, number]] = franc.all(text, { only: filter });
        const language: string = languages[0][0];

        return language === UndefinedLanguage ? [ConfidenceLevel.Unknown, ''] : [ConfidenceLevel.Message, `lang=${language}`];
    }

    //#endregion
}
