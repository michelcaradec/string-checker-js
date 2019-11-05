export class Constants {
    static readonly ExtensionName = 'string-checker-js';
    static readonly ExtensionNameHumanReadable = 'String Checker JS';
    static readonly ExtensionVersion = 'v0.1.0';
    static readonly ExtensionID = 'string-checker-js';
    static readonly ItemStringPrefix = 'string:';
    static readonly ItemRegexPrefix = 'regex:';
    static readonly JQueryIdentifier = '$';
    static readonly ConsoleIdentifier = 'console.';
}

export class LanguageId {
    static readonly TypeScript = 'typescript';
    static readonly TypeScriptReact = 'typescriptreact';
    static readonly JavaScript = 'javascript';
    static readonly JavaScriptReact = 'javascriptreact';
}

export class Messages {
    static readonly NoFileFound = 'No file found';
    static readonly NoFolderWorkspaceOpened = 'No folder or workspace opened';
    // Trailing white-space on purpose.
    static readonly WorkspaceScanInProgress = 'Workspace documents scan in progress... ';
    static readonly DocumentScanInProgress = 'Current document scan in progress...';
    static readonly ScanCompleted = 'Completed';
    static readonly ScanNoTokenFound = 'No token found in file';
    static readonly LanguageNotSupported = Constants.ExtensionName + ' extension only supports TypeScript and JavaScript documents';
    static readonly MaxFileLimitReached = 'Maximum file limit was reached';
    static readonly SelectToken = 'Select token in document';
    static readonly TestString = 'Test string';
    static readonly FilterToken = 'Filter token';
    static readonly EnterString = 'Type a string and press [Enter]';
    static readonly PressEscapeToExit = 'Press [Escape] or [Enter] to close';
}

export class Stats {
    static readonly Scan_Started = 'Scan started';
    static readonly Scan_Completed = 'Scan completed';

    static readonly FileSystem_Title = '- File System -';
    static readonly FileSystem_FoldersPicked = 'Folders picked';
    static readonly FileSystem_FilesPicked = 'Files picked';
    
    static readonly Parser_Title = '- Parser -';

    static readonly Providers_Title = '- Providers -';
    static readonly Providers_Header_Provider = 'Provider';
    static readonly Providers_Header_Technical = 'Technical';
    static readonly Providers_Header_Message = 'Message';
}

export class ConfidenceLevelStr {
    static readonly Unknown = '?';
    static readonly Technical = 'Technical';
    static readonly Message = 'Message';
}

export class StatsEventTypeStr {
    static readonly FolderScanned = 'Folders scanned';
    static readonly FolderExcluded = 'Folders excluded';
    static readonly FileScanned = 'Files scanned';
    static readonly FileExcluded = 'Files excluded';
    static readonly FileSelected = 'Files selected';
    static readonly DocumentScanned = 'Documents scanned';
    static readonly ParserStatementThrowIgnored = '`throw` expressions ignored';
    static readonly ParserStatementJQueryIgnored = 'JQuery expressions ignored';
    static readonly ParserStatementConsoleIgnored = '`console` expressions ignored';
    static readonly ParserToken = 'Tokens selected';
    static readonly DetectedAsTechnicalByClassName = 'Provider ClassName - technical strings';
    static readonly DetectedAsMessageByClassName = 'Provider ClassName - message strings';
    static readonly DetectedAsTechnicalByCode = 'Provider Code - technical strings';
    static readonly DetectedAsMessageByCode = 'Provider Code - message strings';
    static readonly DetectedAsTechnicalByEntropy = 'Provider Entropy - technical strings';
    static readonly DetectedAsMessageByEntropy = 'Provider Entropy - message strings';
    static readonly DetectedAsTechnicalByKeyword = 'Provider Keyword - technical strings';
    static readonly DetectedAsMessageByKeyword = 'Provider Keyword - message strings';
    static readonly DetectedAsTechnicalByLanguage = 'Provider Language - technical strings';
    static readonly DetectedAsMessageByLanguage = 'Provider Language - message strings';
    static readonly DetectedAsTechnicalByString = 'Provider String - technical strings';
    static readonly DetectedAsMessageByString = 'Provider String - message strings'; 
}

export class ProviderName {
    static readonly ClassName = 'Class provider';
    static readonly Code = 'Code provider';
    static readonly Entropy = 'Entropy provider';
    static readonly Keywords = 'Keywords provider';
    static readonly Language = 'Natural language provider';
    static readonly String = 'String provider';
}
