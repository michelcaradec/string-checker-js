export class Constants {
    static readonly ExtensionName = 'string-checker-js';
    static readonly ExtensionVersion = 'v0.0.4';
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

export class ConfidenceLevelStr {
    static readonly Unknown = '?';
    static readonly Technical = 'Technical';
    static readonly Message = 'Message';
}
