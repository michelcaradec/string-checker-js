import { ConfidenceLevel, StatsEventType } from "../../enumerations";

export interface IDetectProvider {
    readonly name: string;
    readonly eventWhenTechnical: StatsEventType;
    readonly eventWhenMessage: StatsEventType;
    readonly isStopOnEval: boolean;
    
    check(text: string): [ConfidenceLevel, string];
}
