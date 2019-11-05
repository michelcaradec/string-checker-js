import { StringDetect } from "./providers/stringDetect";
import { KeywordsDetect } from "./providers/keywordsDetect";
import { CodeDetect } from "./providers/codeDetect";
import { LanguageDetect } from "./providers/languageDetect";
import { EntropyDetect } from "./providers/entropyDetect";
import { ProviderCollection } from "./providerCollection";
import { ClassNameDetect } from "./providers/classNameProvider";
import { IStatsEmiter } from "../stats/statsEmiter";

export class ProviderCollectionFactory {
    static createIncludeAll(statsEmiter: IStatsEmiter): ProviderCollection {
        return new ProviderCollection([new StringDetect()], statsEmiter);
    }

    static createInstance(statsEmiter: IStatsEmiter): ProviderCollection {
        return new ProviderCollection([
            new KeywordsDetect(),
            new ClassNameDetect(),
            new CodeDetect(),
            new LanguageDetect(),
            new EntropyDetect()],
            statsEmiter);
    }
}
