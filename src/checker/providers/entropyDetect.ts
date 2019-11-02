import * as vscode from 'vscode';
import { IDetectProvider } from "./detectProvider";
import { ConfidenceLevel } from "../../enumerations";
import { Constants } from '../../constants';
import { stripNonAlphaCharacters } from '../../helpers/utils';

export class EntropyDetect implements IDetectProvider {
    private _threshold: number;

    constructor() {
        this._threshold = vscode.workspace.getConfiguration(Constants.ExtensionID).get<number>('entropy.threshold')!;
    }

    readonly name: string = 'Entropy provider';

    readonly isStopOnEval: boolean = false;

    check(text: string): [ConfidenceLevel, string] {
        var entropy = this.getShannonEntropy(stripNonAlphaCharacters(text.toLowerCase())!);

        return [entropy > this._threshold ? ConfidenceLevel.Message : ConfidenceLevel.Unknown, `entropy=${entropy.toFixed(2)}`];
    }

    private getShannonEntropy(text: string): number {
        let map: {[id: string]: number; } = {};

        for (const c of text) {
            const count = map[c];
            if (count === undefined) {
                map[c] = 1;
            }
            else {
                map[c] = count + 1;
            }
        }
    
        const len = text.length;
        let result = 0;
        for (const c in map) {
            const count = map[c];
            const frequency = count / len;
            result -= frequency * Math.log(frequency);
        }
        result = result / Math.log(2);
    
        return result;
    }
}
