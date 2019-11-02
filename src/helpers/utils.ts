import { ConfidenceLevel } from "../enumerations";
import { ConfidenceLevelStr } from "../constants";

export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export function distinct<T>(array: Array<T>, compareFn?: (a: T, b: T) => number): Array<T> {
    let dist: Array<T> = [];

    for (const item of array.sort(compareFn)) {
        if (dist.length === 0) {
            dist.push(item);
        } else if (compareFn!(dist[dist.length - 1], item) !== 0) {
            dist.push(item);
        }
    }

    return dist;
}

export function confidenceLevelToString(level: ConfidenceLevel): string {
    switch (level) {
        case ConfidenceLevel.Unknown:
            return ConfidenceLevelStr.Unknown;

        case ConfidenceLevel.Technical:
            return ConfidenceLevelStr.Technical;

        case ConfidenceLevel.Message:
            return ConfidenceLevelStr.Message;

        default:
            throw new Error(`Not supported type ${level}`);
    }
}

export function removeSentenceQuotes(text: string | undefined): string | undefined {
    if (!text || text.length < 2) {
        return text;
    }

    text = text.trim();

    const first = text.charAt(0);
    const last = text.charAt(text.length - 1);

    if ((first === '"' && last === '"')
        || (first === '\'' && last === '\'')) {
        return text.slice(1, -1);
    }

    return text;
}

export function isCamelCase(text: string): boolean {
    return /^[a-z][^\s]+$/.test(text);
}

export function isPascalCase(text: string): boolean {
    return /^([A-Z][^\sA-Z]+)+$/.test(text);
}

export function getNonAlphaRatio(text: string | undefined): number {
    if (!text || text.length <= 0) {
        return 0;
    }

    return 1 - stripNonAlphaCharacters(normalizeString(text))!.length / text.length;
}

export function normalizeString(text: string | undefined): string | undefined {
    if (!text || text.length <= 0) {
        return text;
    }

    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function stripNonAlphaCharacters(text: string | undefined): string | undefined {
    if (!text || text.length <= 0) {
        return text;
    }

    return normalizeString(text)!.replace(/[^a-z\d\s]/ig, '');
}
