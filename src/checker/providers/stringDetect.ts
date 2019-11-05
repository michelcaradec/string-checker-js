import { IDetectProvider } from "./detectProvider";
import { ConfidenceLevel, StatsEventType } from "../../enumerations";
import { ProviderName } from "../../constants";

export class StringDetect implements IDetectProvider {
    //#region IDetectProvider

    readonly name: string = ProviderName.String;
    readonly eventWhenTechnical: StatsEventType = StatsEventType.DetectedAsTechnicalByString;
    readonly eventWhenMessage: StatsEventType = StatsEventType.DetectedAsMessageByString;
    readonly isStopOnEval: boolean = false;

    check(_text: string): [ConfidenceLevel, string] {
        return [ConfidenceLevel.Message, '*'];
    }

    //#endregion
}
