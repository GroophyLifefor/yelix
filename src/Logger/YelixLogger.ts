import { BaseLogger } from "@/src/Logger/BaseLogger.ts";
import type { LogLevel, LogMessage } from "@/src/Logger/CoreLogger.ts";

class YelixLogger extends BaseLogger {
  log(_level: LogLevel, message: LogMessage, _meta?: object): void {
    if (Array.isArray(message)) {
      console.log(...message);
    } else {
      console.log(message);
    }
  }
}

export { YelixLogger };
