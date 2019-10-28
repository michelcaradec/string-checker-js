import { IUserDictionaryItem } from "./userDictionaryItem";
import { ItemString } from "./itemString";
import { ItemRegex } from "./itemRegex";

export class UserDictionaryItemFactory {
    static createInstance(rawValue: string): IUserDictionaryItem {
        if (ItemString.isTypeOf(rawValue)) {
            return ItemString.fromRawValue(rawValue);
        }
        if (ItemRegex.isTypeOf(rawValue)) {
            return ItemRegex.fromRawValue(rawValue);
        }

        return ItemString.fromValue(rawValue);
    }
}
