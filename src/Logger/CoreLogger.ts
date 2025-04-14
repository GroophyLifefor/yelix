// deno-lint-ignore-file no-explicit-any
type LogMessage = string | (string | any)[];

type LogInfo = {
  level: LogLevel;
  logLevel: LogLevel;
  isWillingToLog: boolean;
  prefix: string;
};

type LoggerCallback = (
  message: LogMessage,
  meta: object | null | undefined,
  logInfo: LogInfo,
) => void;

interface ILogger {
  debug(message?: LogMessage, meta?: object): void;
  info(message?: LogMessage, meta?: object): void;
  warn(message?: LogMessage, meta?: object): void;
  error(message: LogMessage, meta?: object): void;
  fatal(message: LogMessage, meta?: object): void;
  on(event: LogMessage, listener: LoggerCallback): void;
  off(event: LogMessage, listener: LoggerCallback): void;
  startPrefix(prefix: string): void;
  endPrefix(): void;
}

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export type { ILogger, LoggerCallback, LogInfo, LogMessage };
export { LogLevel };
