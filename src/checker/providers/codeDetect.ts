import * as vscode from 'vscode';
import { IDetectProvider } from "./detectProvider";
import { ConfidenceLevel, StatsEventType } from "../../enumerations";
import { Constants, ProviderName } from '../../constants';
import { isCamelCase, isPascalCase, getNonAlphaRatio } from '../../helpers/utils';

export class CodeDetect implements IDetectProvider {
    private _minWordLength: number;
    private _maxWordLength: number;
    private _nonAlphaThreshold: number;

    constructor() {
        this._minWordLength = vscode.workspace.getConfiguration(Constants.ExtensionID).get<number>('variable.word-min-length')!;
        this._maxWordLength = vscode.workspace.getConfiguration(Constants.ExtensionID).get<number>('variable.word-max-length')!;
        this._nonAlphaThreshold = vscode.workspace.getConfiguration(Constants.ExtensionID).get<number>('variable.non-alpha-ratio-threshold')!;
    }

    //#region IDetectProvider

    readonly name: string = ProviderName.Code;
    readonly eventWhenTechnical: StatsEventType = StatsEventType.DetectedAsTechnicalByCode;
    readonly eventWhenMessage: StatsEventType = StatsEventType.DetectedAsMessageByCode;
    readonly isStopOnEval: boolean = true;

    private static readonly _startChars = [
        ['..', '..*'],      // Path
        ['#', '#*'],        // Reference
        ['&', '&*'],
        ['<', '<*'],
        ['$', '$*'],
        ['.', '.*'],
        ['_', '_*'],
        ['[', '[*'],
        ['div#', 'dom'],    // JQuery
        ['div.', 'dom'],    // JQuery
        ['tr[', 'html'],
        ['td[', 'html'],
        ['td:', 'html'],
        ['http://', 'url'],
        ['https://', 'url'],
        ['/', 'path']
    ];
    
    check(text: string): [ConfidenceLevel, string] {
        if (text.length < this._minWordLength) {
            // Too short => technical string.
            return [ConfidenceLevel.Technical, `len < ${this._minWordLength}`];
        }

        for (const [searchString, message] of CodeDetect._startChars) {
            if (text.startsWith(searchString)) {
                // Path.
                return [ConfidenceLevel.Technical, message];
            }
        }

        if (text.startsWith('^') && text.endsWith('$')) {
            // Regular expression.
            return [ConfidenceLevel.Technical, 'regex'];
        }

        if (/<[^>]+>/.test(text)) {
            // HTML.
            return [ConfidenceLevel.Technical, 'html'];
        }

        if (/^[A-Z_][A-Z\d_]+$/.test(text)) {
            // Environment variable.
            return [ConfidenceLevel.Technical, 'env'];
        }

        if (/^\d.*$/.test(text)) {
            // Starting with a digit.
            return [ConfidenceLevel.Technical, 'digit'];
        }

        if (/^((d{2,3}|m{2,3}|yyyy|yy|hh|s{2,3})(\/|\-|:|\.|,| )?)+$/i.test(text)) {
            // DateTime patterns.
            return [ConfidenceLevel.Technical, 'datetime'];
        }

        if (/^img\d+x\d+\s/.test(text)) {
            // img.
            return [ConfidenceLevel.Technical, 'img'];
        }

        if (/ ?(>|<|\+|\*|=|\/) ?/.test(text)) {
            // Text with mathematical symbols.
            return [ConfidenceLevel.Technical, 'formula'];
        }

        if (/\s{3,}/.test(text)) {
            // Many contiguous spaces (2 contiguous might me a typo error, but not 3 or more).
            return [ConfidenceLevel.Technical, 'spaces'];
        }

        const posSpace = text.search(/\s/g);
        if (posSpace < 0) {
            // No white space...
            if (text.search(/[\.\-\d@]/g) >= 0) {
                // ...with a {point, dash, digit, @}, for a string too short to be a sentence => technical string.
                return [ConfidenceLevel.Technical, 'no space'];
            }

            if (text.length > this._maxWordLength) {
                // Start of string with no white space too long to be a sentence => technical string.
                return [ConfidenceLevel.Technical, 'length'];
            }

            if (isCamelCase(text)) {
                return [ConfidenceLevel.Technical, 'camelCase'];
            }

            if (isPascalCase(text)) {
                return [ConfidenceLevel.Technical, 'PascalCase'];
            }
        } else {
            if (text.split(' ').some(w => w.length > this._maxWordLength)) {
                // Some words (no white space) too long to be a sentence => technical string.
                return [ConfidenceLevel.Technical, 'word'];
            }
        }

        const nonAlphaRatio = getNonAlphaRatio(text);
        if (nonAlphaRatio > this._nonAlphaThreshold) {
            return [ConfidenceLevel.Technical, `non-alpha=${nonAlphaRatio.toFixed(2)}`];
        }

        return [ConfidenceLevel.Unknown, ''];
    }

    //#endregion
}
