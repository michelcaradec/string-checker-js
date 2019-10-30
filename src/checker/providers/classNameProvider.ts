import { IDetectProvider } from "./detectProvider";
import { ConfidenceLevel } from "../../enumerations";

export class ClassNameDetect implements IDetectProvider {
    readonly name: string = 'Class provider';

    readonly isStopOnEval: boolean = true;
    
    check(text: string): [ConfidenceLevel, string] {
        if (text === 'use strict') {
            return [ConfidenceLevel.Technical, 'javascript'];
        }

        if (/^rgba?\([\d\s,\.]+\)$/m.test(text)) {
            return [ConfidenceLevel.Technical, 'javascript'];
        }

        if (text.search(/fa[rs]? fa(-[^-]*)*/g) >= 0) {
            return [ConfidenceLevel.Technical, 'font awesome'];
        }
        
        if (text.search(/btn btn(-[^-]*)*/g) >= 0) {
            return [ConfidenceLevel.Technical, 'button'];
        }

        if (text.search(/box box(-[^-]*)*/g) >= 0) {
            return [ConfidenceLevel.Technical, 'box'];
        }

        // xxx-yyy
        // xxx-yyy zzz
        if (text.search(/^[^-\s]+-[^ ]+ ([^-]*-)*.*/g) >= 0) {
            return [ConfidenceLevel.Technical, 'class'];
        }

        return [ConfidenceLevel.Unknown, ''];
    }
}
