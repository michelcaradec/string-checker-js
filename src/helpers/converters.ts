import { ConfidenceLevel, StatsEventType } from "../enumerations";
import { ConfidenceLevelStr, StatsEventTypeStr } from "../constants";

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

const _mapEventTypeToString
    = new Map<StatsEventType, string>([
        [StatsEventType.FolderScanned, StatsEventTypeStr.FolderScanned],
        [StatsEventType.FolderExcluded, StatsEventTypeStr.FolderExcluded],
        [StatsEventType.FileScanned, StatsEventTypeStr.FileScanned],
        [StatsEventType.FileExcluded, StatsEventTypeStr.FileExcluded],
        [StatsEventType.FileSelected, StatsEventTypeStr.FileSelected],
        [StatsEventType.DocumentScanned, StatsEventTypeStr.DocumentScanned],
        [StatsEventType.ParserStatementThrowIgnored, StatsEventTypeStr.ParserStatementThrowIgnored],
        [StatsEventType.ParserStatementJQueryIgnored, StatsEventTypeStr.ParserStatementJQueryIgnored],
        [StatsEventType.ParserStatementConsoleIgnored, StatsEventTypeStr.ParserStatementConsoleIgnored],
        [StatsEventType.ParserToken, StatsEventTypeStr.ParserToken],
        [StatsEventType.DetectedAsTechnicalByClassName, StatsEventTypeStr.DetectedAsTechnicalByClassName],
        [StatsEventType.DetectedAsMessageByClassName, StatsEventTypeStr.DetectedAsMessageByClassName],
        [StatsEventType.DetectedAsTechnicalByCode, StatsEventTypeStr.DetectedAsTechnicalByCode],
        [StatsEventType.DetectedAsMessageByCode, StatsEventTypeStr.DetectedAsMessageByCode],
        [StatsEventType.DetectedAsTechnicalByEntropy, StatsEventTypeStr.DetectedAsTechnicalByEntropy],
        [StatsEventType.DetectedAsMessageByEntropy, StatsEventTypeStr.DetectedAsMessageByEntropy],
        [StatsEventType.DetectedAsTechnicalByKeyword, StatsEventTypeStr.DetectedAsTechnicalByKeyword],
        [StatsEventType.DetectedAsMessageByKeyword, StatsEventTypeStr.DetectedAsMessageByKeyword],
        [StatsEventType.DetectedAsTechnicalByLanguage, StatsEventTypeStr.DetectedAsTechnicalByLanguage],
        [StatsEventType.DetectedAsMessageByLanguage, StatsEventTypeStr.DetectedAsMessageByLanguage],
        [StatsEventType.DetectedAsTechnicalByString, StatsEventTypeStr.DetectedAsTechnicalByString],
        [StatsEventType.DetectedAsMessageByString, StatsEventTypeStr.DetectedAsMessageByString]]);

export function statsEventTypeToString(event: StatsEventType): string {
    return _mapEventTypeToString.get(event) ?? '';
}
