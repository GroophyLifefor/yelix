// deno-lint-ignore-file no-explicit-any ban-unused-ignore
import {
  type ILogger,
  type LoggerCallback,
  type LogInfo,
  LogLevel,
  type LogMessage,
} from "@/src/Logger/CoreLogger.ts";

abstract class BaseLogger implements ILogger {
  protected logLevel: LogLevel;
  private listeners: Record<string, LoggerCallback[]> = {};
  private prefix: string = "";

  constructor(level: LogLevel = LogLevel.INFO) {
    this.logLevel = level;
  }

  on(event: string, fn: LoggerCallback) {
    (this.listeners[event] ||= []).push(fn);
  }

  off(event: string, fn: LoggerCallback) {
    this.listeners[event] = (this.listeners[event] || []).filter(
      (f) => f !== fn,
    );
  }

  private emit(
    event: string,
    message: LogMessage,
    meta: any,
    logInfo: LogInfo,
  ) {
    for (const fn of this.listeners[event] || []) {
      fn(message, meta, logInfo);
    }
  }

  startPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  endPrefix(): void {
    this.prefix = "";
  }

  abstract log(
    level: LogLevel,
    message: LogMessage,
    meta?: object,
  ): void;

  private sendLog(
    logLevel: LogLevel,
    message: LogMessage,
    meta?: object,
  ): void {
    const isWillingToLog = this.logLevel <= logLevel;
    const logMessage = this.prefix + message;

    this.emit("onBeforeLog", logMessage, meta, {
      level: logLevel,
      logLevel: this.logLevel,
      isWillingToLog,
      prefix: this.prefix,
    });

    if (isWillingToLog) {
      this.log(logLevel, logMessage, meta);
    }

    this.emit("onAfterLog", logMessage, meta, {
      level: logLevel,
      logLevel: this.logLevel,
      isWillingToLog,
      prefix: this.prefix,
    });
  }

  debug(message: LogMessage = "", meta?: object): void {
    this.sendLog(LogLevel.DEBUG, message, meta);
  }

  info(message: LogMessage = "", meta?: object): void {
    this.sendLog(LogLevel.INFO, message, meta);
  }

  warn(message: LogMessage, meta?: object): void {
    this.sendLog(LogLevel.WARN, message, meta);
  }

  error(message: LogMessage, meta?: object): void {
    this.sendLog(LogLevel.ERROR, message, meta);
  }

  fatal(message: string, meta?: object): void {
    this.sendLog(LogLevel.FATAL, message, meta);
  }
}

export { BaseLogger };
