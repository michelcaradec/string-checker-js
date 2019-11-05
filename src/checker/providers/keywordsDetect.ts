import { IDetectProvider } from "./detectProvider";
import { ConfidenceLevel, DictionaryType, StatsEventType } from "../../enumerations";
import { UserDictionaryFactory } from '../../user-dictionary/userDictionaryFactory';
import { UserDictionary } from "../../user-dictionary/userDictionary";
import { ProviderName } from "../../constants";

export class KeywordsDetect implements IDetectProvider {
    private _technicalList: UserDictionary;
    private _messageList: UserDictionary;

    constructor() {
        this._technicalList = UserDictionaryFactory.createInstance(DictionaryType.ExcludeToken) || new UserDictionary();
        this._messageList = UserDictionaryFactory.createInstance(DictionaryType.IncludeToken) || new UserDictionary();
    }

    //#region IDetectProvider

    readonly name: string = ProviderName.Keywords;
    readonly eventWhenTechnical: StatsEventType = StatsEventType.DetectedAsTechnicalByKeyword;
    readonly eventWhenMessage: StatsEventType = StatsEventType.DetectedAsMessageByKeyword;
    readonly isStopOnEval: boolean = true;

    check(text: string): [ConfidenceLevel, string] {
        const fromListMessage = 'from list';

        if (this._technicalList.contains(text)) {
            return [ConfidenceLevel.Technical, fromListMessage];
        }

        if (this._messageList.contains(text)) {
            return [ConfidenceLevel.Message, fromListMessage];
        }

        return [ConfidenceLevel.Unknown, ''];
    }

    //#endregion
}
