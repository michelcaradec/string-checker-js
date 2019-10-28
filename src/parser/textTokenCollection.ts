import { TextToken } from "./textToken";

export class TextTokenCollection {
    items: TextToken[] = [];

    push(item: TextToken): void {
        const existing = this.items.find((value, _index, _number) => value.value === item.value);
        if (existing === undefined) {
            this.items.push(item);
        } else {
            existing.push(item);
        }
    }
}
