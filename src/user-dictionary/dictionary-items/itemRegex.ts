import { IUserDictionaryItem } from "./userDictionaryItem";
import { Constants } from "../../constants";
import escapeStringRegexp = require('escape-string-regexp');

export class ItemRegex implements IUserDictionaryItem {
    private static readonly _prefix = Constants.ItemRegexPrefix;

    readonly rawValue: string;
    private _workingValue: string;
    private _regex: RegExp;

    private constructor(rawValue: string, workingValue: string) {
        this.rawValue = rawValue;
        this._workingValue = workingValue;
        try {
            this._regex = new RegExp(this._workingValue, 'im');
        } catch (error) {
            console.log(`Error parsing regular expression "${this._workingValue}": ${error}`);
            this._regex = new RegExp('.*');
        }
    }

    static isTypeOf(rawValue: string): boolean {
        return rawValue.slice(0, this._prefix.length) === this._prefix;
    }

    static fromRawValue(rawValue: string): IUserDictionaryItem {
        return new ItemRegex(rawValue, rawValue.slice(this._prefix.length));
    }

    static fromValue(value: string): IUserDictionaryItem {
        return new ItemRegex(this._prefix + value, value);
    }

    static escape(value: string): string {
        return escapeStringRegexp(value);
    }

    compare(value: string): boolean {
        return this._regex.test(value);
    }
}
