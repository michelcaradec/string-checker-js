import { IDetectProvider } from "./providers/detectProvider";
import { ConfidenceLevel } from "../enumerations";
import { IStatsEmiter } from "../stats/statsEmiter";

export class ProviderCollection {
    private _providers: IDetectProvider[];
    private _statsEmiter: IStatsEmiter;

    constructor(providers: IDetectProvider[], statsEmiter: IStatsEmiter) {
        this._providers = providers ? providers : [];
        this._statsEmiter = statsEmiter;
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

        this.emitStats(bestProvider, bestLevel);
        
        return [bestProvider, bestLevel, bestMessage];
    }

    private emitStats(provider: IDetectProvider | undefined, level: ConfidenceLevel): void {
        if (provider) {
            switch (level) {
                case ConfidenceLevel.Technical:
                    this._statsEmiter.emit(provider.eventWhenTechnical);
                    break;

                case ConfidenceLevel.Message:
                    this._statsEmiter.emit(provider.eventWhenMessage);
                    break;
            }
        }
    }

    test(text: string): [IDetectProvider | undefined, ConfidenceLevel, string][] {
        return this._providers.map(provider => {
            let [result, message] = provider.check(text);
            return [provider, result, message];
        });
    }
}
