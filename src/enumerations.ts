export enum ConfidenceLevel {
    Unknown,
    Technical,
    Message
}

export enum DictionaryType {
    IncludeToken,
    ExcludeToken,
    ExcludeFile,
    ExcludeFolder
}

export enum TreeViewType {
    FileToTokens,
    TokenToFiles
}

export enum StatsEventType {
    /**
     * A folder was detected.
     */
    FolderScanned,
    /**
     * A folder was ignored.
     */
    FolderExcluded,
    /**
     * A file was detected.
     */
    FileScanned,
    /**
     * A file was ignored.
     */
    FileExcluded,
    /**
     * A file was selected for parsing.
     */
    FileSelected,
    /**
     * A document was opened.
     */
    DocumentScanned,
    /**
     * Document parser ignored a `throw` expression.
     */
    ParserStatementThrowIgnored,
    /**
     * Document parser ignored a JQuery expression.
     */
    ParserStatementJQueryIgnored,
    /**
     * Document parser ignored a `console` expression.
     */
    ParserStatementConsoleIgnored,
    /**
     * Document parser found a token.
     */
    ParserToken,
    DetectedAsTechnicalByClassName,
    DetectedAsMessageByClassName,
    DetectedAsTechnicalByCode,
    DetectedAsMessageByCode,
    DetectedAsTechnicalByEntropy,
    DetectedAsMessageByEntropy,
    DetectedAsTechnicalByKeyword,
    DetectedAsMessageByKeyword,
    DetectedAsTechnicalByLanguage,
    DetectedAsMessageByLanguage,
    DetectedAsTechnicalByString,
    DetectedAsMessageByString
}
