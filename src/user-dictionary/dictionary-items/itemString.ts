import { IUserDictionaryItem } from "./userDictionaryItem";
import { Constants } from "../../constants";

export class ItemString implements IUserDictionaryItem {
    private static readonly _prefix = Constants.ItemStringPrefix;

    readonly rawValue: string;
    private _workingValue: string;

    private constructor(rawValue: string, workingValue: string) {
        this.rawValue = rawValue;
        this._workingValue = workingValue;
    }

    static isTypeOf(rawValue: string): boolean {
        return rawValue.slice(0, this._prefix.length) === this._prefix;
    }

    static fromRawValue(rawValue: string): IUserDictionaryItem {
        return new ItemString(rawValue, rawValue.slice(this._prefix.length));
    }

    static fromValue(value: string): IUserDictionaryItem {
        return new ItemString(this._prefix + value, value);
    }

    compare(value: string): boolean {
        return this._workingValue === value;
    }
}
