// [Parser · TypeScript Deep Dive](https://basarat.gitbooks.io/typescript/content/docs/compiler/parser.html)
import * as ts from "typescript";
import { TextToken } from "./textToken";
import { Constants } from "../constants";
import { IStatsEmiter } from "../stats/statsEmiter";
import { StatsEventType } from "../enumerations";

export class TextParser {
    private _statsEmiter: IStatsEmiter;
    private _generator: IterableIterator<ts.Node>;
    private _ignoreJQuery: boolean;
    private _jQueryIdentifier: string;
    private _ignoreThrowStatement: boolean;
    private _ignoreConsole: boolean = true;
    private _consoleIdentifier: string = Constants.ConsoleIdentifier;

    private static readonly _kinds = new Set<ts.SyntaxKind>([
        ts.SyntaxKind.StringLiteral,
        ts.SyntaxKind.NoSubstitutionTemplateLiteral,
        ts.SyntaxKind.TemplateHead,
        ts.SyntaxKind.TemplateMiddle,
        ts.SyntaxKind.TemplateTail]);

    constructor(statsEmiter: IStatsEmiter,
                text: string,
                ignoreJQuery: boolean = true,
                jQueryIdentifier: string = Constants.JQueryIdentifier,
                ignoreThrowStatement: boolean = true) {
        this._statsEmiter = statsEmiter;
        this._generator = this.getNodeKind(ts.createSourceFile('script.ts', text, ts.ScriptTarget.ES5, true));
        this._ignoreJQuery = ignoreJQuery;
        this._jQueryIdentifier = jQueryIdentifier;
        this._ignoreThrowStatement = ignoreThrowStatement;
    }

    private *getNodeKind(node: ts.Node): IterableIterator<ts.Node> {
        if (TextParser._kinds.has(node.kind)) {
            yield node;
        }

        if (this._ignoreThrowStatement
            && node.kind === ts.SyntaxKind.ThrowStatement) {
            this._statsEmiter.emit(StatsEventType.ParserStatementThrowIgnored);
            return;
        }

        const children = node.getChildren();
        if (this._ignoreJQuery
            && children.some(n => n.kind === ts.SyntaxKind.Identifier && n.getText() === this._jQueryIdentifier)) {
                this._statsEmiter.emit(StatsEventType.ParserStatementJQueryIgnored);
            return;
        }

        if (this._ignoreConsole
            && children.some(n => n.kind === ts.SyntaxKind.PropertyAccessExpression && n.getText().startsWith(this._consoleIdentifier))) {
            this._statsEmiter.emit(StatsEventType.ParserStatementConsoleIgnored);
            return;
        }

        for (let subNodes of children.map(n => this.getNodeKind(n))) {
            for (let subNode of subNodes) {
                yield subNode;
            }
        }
    }

    /**
     * Get next non-empty string.
     * @returns `TextToken` object.
     */
    getNextToken(): TextToken | null {
        while (true) {
            const node = this._generator.next();
            if (node.done) {
                return null;
            }
    
            let value = node.value.getText();
            value = value
                // Remove quotes.
                .slice(1, value.length - 1)
                // Remove beginning and ending spaces.
                .trim();

            if (value !== '') {
                this._statsEmiter.emit(StatsEventType.ParserToken);
    
                return new TextToken(value, node.value.pos, node.value.end);
            }    
        }
    }
}
