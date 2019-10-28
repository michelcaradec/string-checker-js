import { IDetectProvider } from "./detectProvider";
import { ConfidenceLevel } from "../../enumerations";

export class StringDetect implements IDetectProvider {
    readonly name: string = 'String provider';

    readonly isStopOnEval: boolean = false;

    check(_text: string): [ConfidenceLevel, string] {
        return [ConfidenceLevel.Message, '*'];
    }
}
