import * as vscode from 'vscode';
import { IDetectProvider } from "./detectProvider";
import { ConfidenceLevel } from "../../enumerations";
import { Constants } from '../../constants';

export class CodeDetect implements IDetectProvider {
    private _minWordLength: number;
    private _maxWordLength: number;
    readonly name: string = 'Code provider';

    readonly isStopOnEval: boolean = true;

    constructor() {
        this._minWordLength = vscode.workspace.getConfiguration(Constants.ExtensionID).get<number>('variable.word-min-length')!;
        this._maxWordLength = vscode.workspace.getConfiguration(Constants.ExtensionID).get<number>('variable.word-max-length')!;
    }

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

            if (this.isCamelCase(text)) {
                return [ConfidenceLevel.Technical, 'camelCase'];
            }

            if (this.isPascalCase(text)) {
                return [ConfidenceLevel.Technical, 'PascalCase'];
            }
        } else {
            if (text.split(' ').some(w => w.length > this._maxWordLength)) {
                // Some words (no white space) too long to be a sentence => technical string.
                return [ConfidenceLevel.Technical, 'word'];
            }
        }

        // FIXME: Exclude environment variables (`MONGODB_URI_LOCAL`).

        return [ConfidenceLevel.Unknown, ''];
    }

    private isCamelCase(text: string): boolean {
        return /^[a-z][^\s]+$/.test(text);
    }

    private isPascalCase(text: string): boolean {
        return /^([A-Z][^\sA-Z]+)+$/.test(text);
    }
}
