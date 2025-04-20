import { type ILogger, LogLevel } from "@/src/Logger/CoreLogger.ts";
import { YelixLogger } from "@/src/Logger/YelixLogger.ts";
import type { EnvironmentType } from "@/src/types/types.d.ts";

const logLevelByEnvironment: Record<EnvironmentType, LogLevel> = {
  debug: LogLevel.DEBUG,
  dev: LogLevel.INFO,
  test: LogLevel.INFO,
  prod: LogLevel.INFO,
};

class LoggerFactory {
  static createLogger(environment: EnvironmentType): ILogger {
    const logger = new YelixLogger(logLevelByEnvironment[environment]);
    return logger;
  }
}

export { LoggerFactory };

/*
  -------------------
  | USAGE EXAMPLE:  |
  -------------------

  const logger = LoggerFactory.createLogger('prod');

  logger.on('onBeforeLog', (message, meta, logInfo) => {
    console.log('Before log:', {
      message,
      meta,
      logInfo,
    });
  });

  logger.on('onAfterLog', (message, meta, logInfo) => {
    console.log('After log:', {
      message,
      meta,
      logInfo,
    });
  });

  logger.debug('Debug message', { test: 'test' });
  logger.info('Yelix Logger', { test: 'test' });
  logger.warn('Warning message', { test: 'test' });
  logger.error('Error message', { test: 'test' });
  logger.fatal('Fatal message', { test: 'test' });
*/
