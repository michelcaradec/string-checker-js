import { ConfidenceLevel } from "../../enumerations";

export interface IDetectProvider {
    readonly name: string;
    readonly isStopOnEval: boolean;
    
    check(text: string): [ConfidenceLevel, string];
}
