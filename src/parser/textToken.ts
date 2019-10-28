import { ConfidenceLevel } from "../enumerations";
import { IDetectProvider } from "../checker/providers/detectProvider";

/**
 * Token.
 */
export class TextToken {
    /**
     * Token value.
     */
    value: string;
    /**
     * Positions where token was found.
     */
    positions: [number, number][] = [];
    /**
     * Level of confidence for token detection.
     */
    level: ConfidenceLevel | undefined;
    /**
     * Informations related to token detection.
     */
    info: string | undefined;
    /**
     * Provider that found token.
     */
    provider: IDetectProvider | undefined;

    constructor(value: string, start: number, end: number) {
        this.value = value;
        this.positions.push([start, end]);
    }

    /**
     * Add a position for this token.
     * @param item Token to add.
     */
    push(item: TextToken): void {
        if (item.value !== this.value) {
            throw new Error(`Invalid token name: ${item.value}, expected: ${this.value}`);
        }

        for (var position of item.positions) {
            this.positions.push(position);
        }
    }
}
