# String Checker JS

Scan TypeScript and JavaScript documents for non-technical strings.

The aim is to help identifying strings in code that might need to be translated.  
Such strings should be moved in a dedicated resource file for translation purpose.

## Features

**Scan** workspace documents, and **navigate** from string to string in source code:

![demo-scan-workspace](https://raw.githubusercontent.com/michelcaradec/string-checker-js/master/readme_assets/demo-scan-workspace.gif)

**Switch** view to browse detected strings:

![demo-switch-view](https://raw.githubusercontent.com/michelcaradec/string-checker-js/master/readme_assets/demo-switch-view.gif)

Add **custom rules** to improve string detection:

![demo-exclude-token](https://raw.githubusercontent.com/michelcaradec/string-checker-js/master/readme_assets/demo-exclude-token.gif)

**Search** for strings in view:

![demo-filter](https://raw.githubusercontent.com/michelcaradec/string-checker-js/master/readme_assets/demo-filter.gif)

### Detection providers

Strings are evaluated by different providers, each being dedicated to a specific area.

| Provider | Description | Example |
|---|---|---|
| Keywords provider | Detects strings from **user list**. | "far fa-smile" will be detected as a [Font Awesome smile icon](https://fontawesome.com/icons/smile?style=regular). |
| Class provider | Detects strings as **class names** or **expressions**. | "use strict" will be detected as JavaScript expression. |
| Code provider | Detects strings as **code** (variable names). | "../path/to/my/file" will be detected as a path.<br>"someVariable" will be detected as a camel case variable. |
| Natural language provider | Detects strings as **natural language**. | ["Ceci n'est pas une pipe"](https://en.wikipedia.org/wiki/Ren%C3%A9_Magritte) will be detected as french language. |
| Entropy provider | Detects string as **[Gibberish](https://en.wikipedia.org/wiki/Gibberish)**.<br>String [entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory)) [1] threshold can be configured in settings (`entropy.threshold`, default = 3). | "abbcccddddeeeee" has an entropy of 2.15.<br>"dd/MM/yyyy hh:mm:ss" has an entropy of 2.44.<br>["Gloubi-boulga"](https://fr.wikipedia.org/wiki/Gloubi-boulga) has an entropy of 2.75. |
| String provider | **Pass-through** detection. | *Any string will be detected as such.* |

- [1] Starting at version v0.0.3, **entropy** is computed after removing non-alphabetical characters from a lower case version of the string.

The `string.checker.js.testString` [command](#extension-settings) brings a convenient way to test all providers for a given string.

![demo-test-string](https://raw.githubusercontent.com/michelcaradec/string-checker-js/master/readme_assets/demo-test-string.gif)

## Requirements

*There are no known requirements.*

## Extension Settings

This extension contributes the following settings:

- `string.checker.js.scanDocument`: scan selected document.
- `string.checker.js.scanDocumentIncludeAll`: scan selected document for any string.
- `string.checker.js.scanDocumentWorkspace`: scan workspace documents.
- `string.checker.js.scanDocumentWorkspaceIncludeAll`: scan workspace documents for any string.
- `string.checker.js.switchView`: switch between file/token and token/file view.
- `string.checker.js.excludeParentFolderPath`: exclude a file (using its path) containing folder from scan [1].
- `string.checker.js.excludeParentFolderName`: exclude a file (using its name) containing folder from scan [1].
- `string.checker.js.excludeFilePath`: exclude a file (using its path) from scan [1].
- `string.checker.js.excludeFileName`: exclude a file (using its name) from scan [1].
- `string.checker.js.excludeToken`: exclude a token from scan result.
- `string.checker.js.includeToken`: include a token to scan result.
- `string.checker.js.selectTreeItem`: select token in document.
- `string.checker.js.filterTokens`: filter tokens view.
- `string.checker.js.testString`: test a string with all detection [providers](#detection-providers).
- `string.checker.js.showVersion`: display String Checker JS version.

- [1] **Path exclusion** is based on the full path (`/path/to/my/file.js`), while **name exclusion** only uses the last part (`file.js` for a file, `my` for a folder), which means if the same name is found in another folder, it will be excluded too.

## Mentions

- [Font Awesome](https://fontawesome.com/icons/) icon is used for tokens activity bar.
- [freeicons.io](https://www.freeicons.io/) icons are used for tokens view.
- [franc](https://github.com/wooorm/franc) library is used for natural language detection.
- [escape-string-regexp](https://github.com/sindresorhus/escape-string-regexp) library is used for regular expressions strings escape.
- [TypeScript-Node-Starter](https://github.com/Microsoft/TypeScript-Node-Starter) Microsoft sample project is used for demonstration purpose.
