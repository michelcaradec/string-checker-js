import { StringDetect } from "./providers/stringDetect";
import { KeywordsDetect } from "./providers/keywordsDetect";
import { CodeDetect } from "./providers/codeDetect";
import { LanguageDetect } from "./providers/languageDetect";
import { EntropyDetect } from "./providers/entropyDetect";
import { ProviderCollection } from "./providerCollection";
import { ClassNameDetect } from "./providers/classNameProvider";

export class ProviderCollectionFactory {
    static createIncludeAll(): ProviderCollection {
        return  new ProviderCollection([new StringDetect()]);
    }

    static createInstance(): ProviderCollection {
        return new ProviderCollection([
            new KeywordsDetect(),
            new ClassNameDetect(),
            new CodeDetect(),
            new LanguageDetect(),
            new EntropyDetect()]);
    }
}
