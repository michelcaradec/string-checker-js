import { IDetectProvider } from "./detectProvider";
import { ConfidenceLevel, StatsEventType } from "../../enumerations";
import { ProviderName } from "../../constants";

export class ClassNameDetect implements IDetectProvider {
    //#region IDetectProvider

    readonly name: string = ProviderName.ClassName;
    readonly eventWhenTechnical: StatsEventType = StatsEventType.DetectedAsTechnicalByClassName;
    readonly eventWhenMessage: StatsEventType = StatsEventType.DetectedAsMessageByClassName;
    readonly isStopOnEval: boolean = true;
    
    check(text: string): [ConfidenceLevel, string] {
        if (text === 'use strict') {
            return [ConfidenceLevel.Technical, 'javascript'];
        }

        if (/^rgba?\([\d\s,\.]+\)$/m.test(text)) {
            return [ConfidenceLevel.Technical, 'javascript'];
        }

        if (/^calc\([^\)]+\)$/m.test(text)) {
            return [ConfidenceLevel.Technical, 'javascript'];
        }

        if (text.search(/fa[rs]? fa(-[^-]*)*/g) >= 0) {
            return [ConfidenceLevel.Technical, 'font awesome'];
        }

        if (/^([a-z]+)\s\1-.+$/.test(text)) {
            // `table table-*`.
            return [ConfidenceLevel.Technical, 'class'];
        }

        if (/^query +\{/.test(text)
            || /^query\(/.test(text)
            || /^query +[a-zA-Z_][a-zA-Z\d_]+\(/.test(text)
            || /^mutation\(/.test(text)) {
            // `query {...}`
            // `query(...)`
            // `query myFunction(...)`
            // `mutation(...)`
            return [ConfidenceLevel.Technical, 'graphql'];
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

    //#endregion
}
