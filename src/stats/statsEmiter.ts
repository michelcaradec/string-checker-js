import { StatsEventType } from "../enumerations";

export interface IStatsEmiter {    
    emit(event: StatsEventType, value?: number): void;
}
