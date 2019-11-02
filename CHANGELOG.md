# Change Log

*All notable changes to the "string-checker-js" extension will be documented in this file.*  
*The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).*

## Known Issues

Here are a few common issues.

- String detection by language provider is based on statistical analysis. The longer the string, the more accurate the detection.

## [Unreleased]

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
