# Change Log

*All notable changes to the "string-checker-js" extension will be documented in this file.*  
*The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).*

## Known Issues

Here are a few common issues.

- String detection by language provider is based on statistical analysis. The longer the string, the more accurate the detection.

## [Unreleased]

## [0.1.4] - 2021-04-14

### Changed

- Security vulnerability upgrade of library [lodash](https://github.com/lodash/lodash) to 4.17.21.
- Security vulnerability upgrade of library [y18n](https://github.com/yargs/y18n) to 4.0.1.
- Security vulnerability upgrade of library [trim](https://github.com/Trott/trim) to 1.0.1.
- Upgrade of library [franc](https://github.com/wooorm/franc) to 5.0.0.

## [0.1.3] - 2020-03-25

### Changed

- Upgrade of [minimist](https://www.npmjs.com/package/minimist) package version 1.2.5 in remediation of [vulnerability alert](https://snyk.io/vuln/SNYK-JS-MINIMIST-559764).

## [0.1.2] - 2019-11-11

### Added

- Code provider:
  - Snake case variable detection.

## [0.1.1] - 2019-11-09

### Added

- Keywords in package.json to improve extension search in market place.

### Changed

- Update to [TypeScript 3.7](https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/).
- Code provider:
  - `px` HTML expression detection.
  - Improvement in camel case variable detection.

### Fixed

- There was an error when calling commands `testString` and `showVersion`.

## [0.1.0] - 2019-11-05

### Added

- Scan metrics are collected and displayed in a dedicated output console.
- New configuration setting `string-checker-js.output.show-on-completion` to show output console on scan completion.

### Changed

- Configuration settings grouped under name "String Checker JS".
- Code refactoring to allow metrics collection.

## [0.0.4] - 2019-11-02

### Changed

- Incorrect entropy values in README.

## [0.0.3] - 2019-11-01

### Added

- Code provider:
  - Strings starting with a digit detection.
  - DateTime patterns (eg.: `dd/MM/yyyy hh:mm`) detection.
  - `img` HTML expression detection.
  - Mathematical symbols detection (eg.: `this > that`).
  - Strings with more than two contiguous spaces.
- Class provider:
  - `calc()` JavaScript expression detection.
  - GraphQL expressions (`query`, `mutation`) detection.
- New configuration setting `string-checker-js.file-extension-exclude` to specify file extensions to exclude from scan (default: `.d.ts`, `.min.js`).
- New configuration setting `string-checker-js.variable.non-alpha-ratio-threshold` to specify the amount of non-alphabetical characters allowed in a string (default: `0.2`).

### Changed

- Entropy provider:
  - Entropy is now computed from a string cleaned of its non-alphabetical characters.  
    Example:  
    `'"{field}" is invalid!'` has an entropy of 3.63.  
    `'field is invalid'` has an entropy of = 3.12.
- File extension filtering now uses a suffix-compare method to support multiple-dots extension (eg.: `.d.ts`).
- Configuration setting `string-checker-js.workspace.file-max` maximum value set to 1000 (500 before).
- Tokens are all collapsed by default when switching to token/file view.
- Code refactoring.

## [0.0.2] - 2019-10-30

### Added

- Code provider:
  - Environment variable detection.
- Class provider:
  - `rgb()` JavaScript expression detection.

### Changed

- Formatting in README file.
- "Release Notes" section removed from README file.
- "Known Issues" section mode from README to CHANGELOG file.
- Code refactoring.

## [0.0.1] - 2019-10-28

### Added

- Initial release.
