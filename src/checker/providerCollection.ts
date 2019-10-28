import { IDetectProvider } from "./providers/detectProvider";
import { ConfidenceLevel } from "../enumerations";

export class ProviderCollection {
    private _providers: IDetectProvider[];

    constructor(providers: IDetectProvider[]) {
        this._providers = providers ? providers : [];
    }

    check(text: string): [IDetectProvider | undefined, ConfidenceLevel, string] {
        let bestProvider: IDetectProvider | undefined = undefined;
        let bestLevel: ConfidenceLevel = ConfidenceLevel.Unknown;
        let bestMessage: string = '';

        for (const provider of this._providers) {
            let [result, message] = provider.check(text);

            if (result > bestLevel) {
                bestProvider = provider;
                bestLevel = result;
                bestMessage = message;

                if (result === ConfidenceLevel.Message) {
                    break;
                }
            }

            if (provider.isStopOnEval && result !== ConfidenceLevel.Unknown) {
                break;
            }
        }
        
        return [bestProvider, bestLevel, bestMessage];
    }

    test(text: string): [IDetectProvider | undefined, ConfidenceLevel, string][] {
        return this._providers.map(provider => {
            let [result, message] = provider.check(text);
            return [provider, result, message];
        });
    }
}
