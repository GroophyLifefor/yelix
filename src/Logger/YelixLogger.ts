import { BaseLogger } from "@/src/Logger/BaseLogger.ts";
import { LogLevel } from "@/src/Logger/CoreLogger.ts";

class YelixLogger extends BaseLogger {
  log(level: LogLevel, message: string, meta?: object): void {
    const timestamp = new Date().toISOString();
    const metaString = meta ? JSON.stringify(meta) : "";
    console.log(`[${timestamp}] [${LogLevel[level]}] ${message} ${metaString}`);
  }
}

export { YelixLogger };
