import * as vscode from 'vscode';
import { IDetectProvider } from "./detectProvider";
import { ConfidenceLevel } from "../../enumerations";
import { Constants } from '../../constants';
var franc = require('franc');

const UndefinedLanguage: string = 'und';

export class LanguageDetect implements IDetectProvider {
    readonly name: string = 'Natural language provider';
    
    readonly isStopOnEval: boolean = false;

    check(text: string): [ConfidenceLevel, string] {
        const filter = vscode.workspace.getConfiguration(Constants.ExtensionID).get<string[]>('language.languages-check')!;
        const languages: [[string, number]] = franc.all(text, { only: filter });
        const language: string = languages[0][0];

        // FIXME: Details on detected language are somewhat confusing (especially for short strings) and might not be relevant to display.
        return language === UndefinedLanguage ? [ConfidenceLevel.Unknown, ''] : [ConfidenceLevel.Message, `lang=${language}`];
    }
}
