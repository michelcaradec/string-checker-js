import { IUserDictionaryItem } from "./dictionary-items/userDictionaryItem";

export class UserDictionary {
    private _dictionary: Set<IUserDictionaryItem> = new Set<IUserDictionaryItem>();

    constructor(source?: UserDictionary) {
        if (source) {
            source.forEach(item => this._dictionary.add(item));
        }
    }

    add(item: IUserDictionaryItem): void {
        this._dictionary.add(item);
    }

    contains(value :string): boolean {
        for (const item of this._dictionary.keys()) {
            if (item.compare(value)) {
                return true;
            }
        }
        return false;
    }

    forEach(callback: (item: IUserDictionaryItem) => void): void {
        this._dictionary.forEach(callback);
    }
}
