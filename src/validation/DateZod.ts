// deno-lint-ignore-file no-explicit-any
import type { YelixInput } from "@/src/validation/inp.ts";
import {
  type FailedMessage,
  YelixValidationBase,
} from "@/src/validation/ValidationBase.ts";

type DateFormat = {
  format: string;
  locale?: string;
  timezone?: string;
};

type DateConfig = {
  formats: DateFormat[];
  defaultLocale?: string;
  defaultTimezone?: string;
};

class DateZod extends YelixValidationBase {
  private input: YelixInput;
  private config: DateConfig;

  constructor(_input: YelixInput, config?: DateConfig) {
    super();
    this.input = _input;
    this.config = {
      formats: [{ format: "yyyy-MM-dd" }],
      defaultLocale: "en-US",
      defaultTimezone: "UTC",
      ...config,
    };

    this.required();
    this.isValidType();
  }

  required(failedMessage?: FailedMessage): this {
    this.addRule(
      "required",
      null,
      (value: any) => ({
        isOk: value !== undefined && value !== null,
      }),
      failedMessage ? failedMessage : "This field is required.",
    );
    return this;
  }

  isValidType(failedMessage?: FailedMessage): this {
    this.addRule(
      "isValidType",
      "date",
      (value: any) => {
        if (value === null || value === undefined) return { isOk: true };
        if (value instanceof Date) return { isOk: !isNaN(value.getTime()) };
        if (typeof value === "string") {
          const date = new Date(value);
          return {
            isOk: !isNaN(date.getTime()),
            newValue: date,
          };
        }
        return { isOk: false };
      },
      failedMessage ? failedMessage : "Value must be a valid date",
    );
    return this;
  }

  optional(): this {
    this.removeRule("required");
    return this;
  }

  isDate(failedMessage?: FailedMessage): this {
    this.addRule(
      "isDate",
      null,
      (value: any) => ({
        isOk: value instanceof Date || !isNaN(Date.parse(value)),
        newValue: value instanceof Date ? value : new Date(value),
      }),
      failedMessage ? failedMessage : "Invalid date format",
    );
    return this;
  }

  min(minDate: Date | string, failedMessage?: FailedMessage): this {
    const min = minDate instanceof Date ? minDate : new Date(minDate);
    this.addRule(
      "min",
      min,
      (value: any, min: Date) => ({
        isOk: value instanceof Date && value >= min,
      }),
      failedMessage
        ? failedMessage
        : `Date must be after or equal to ${min.toLocaleDateString()}`,
    );
    return this;
  }

  max(maxDate: Date | string, failedMessage?: FailedMessage): this {
    const max = maxDate instanceof Date ? maxDate : new Date(maxDate);
    this.addRule(
      "max",
      max,
      (value: any, max: Date) => ({
        isOk: value instanceof Date && value <= max,
      }),
      failedMessage
        ? failedMessage
        : `Date must be before or equal to ${max.toLocaleDateString()}`,
    );
    return this;
  }

  format(format: string | DateFormat, failedMessage?: FailedMessage): this {
    const dateFormat = typeof format === "string" ? { format } : format;
    this.addRule(
      "format",
      dateFormat,
      (value: any, dateFormat: DateFormat) => {
        try {
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return { isOk: false };

          // Custom date formatting
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");

          const formatted = dateFormat.format
            .replace("yyyy", year.toString())
            .replace("MM", month)
            .replace("dd", day)
            .replace("HH", hours)
            .replace("mm", minutes)
            .replace("ss", seconds);

          return {
            isOk: true,
            newValue: formatted,
          };
        } catch {
          return { isOk: false };
        }
      },
      failedMessage
        ? failedMessage
        : `Date must match format ${dateFormat.format}`,
    );
    return this;
  }

  timezone(timezone: string, failedMessage?: FailedMessage): this {
    this.addRule(
      "timezone",
      timezone,
      (value: any, timezone: string) => {
        try {
          const date = new Date(value);
          return {
            isOk: true,
            newValue: new Date(
              date.toLocaleString("en-US", { timeZone: timezone }),
            ),
          };
        } catch {
          return { isOk: false };
        }
      },
      failedMessage ? failedMessage : `Invalid timezone: ${timezone}`,
    );
    return this;
  }

  future(failedMessage?: FailedMessage): this {
    this.addRule(
      "future",
      null,
      (value: any) => ({
        isOk: value instanceof Date && value > new Date(),
      }),
      failedMessage ? failedMessage : "Date must be in the future",
    );
    return this;
  }

  past(failedMessage?: FailedMessage): this {
    this.addRule(
      "past",
      null,
      (value: any) => ({
        isOk: value instanceof Date && value < new Date(),
      }),
      failedMessage ? failedMessage : "Date must be in the past",
    );
    return this;
  }

  weekday(days: number[], failedMessage?: FailedMessage): this {
    this.addRule(
      "weekday",
      days,
      (value: any, days: number[]) => ({
        isOk: value instanceof Date && days.includes(value.getDay()),
      }),
      failedMessage
        ? failedMessage
        : `Date must be on ${days.map((d) => this.getDayName(d)).join(" or ")}`,
    );
    return this;
  }

  age(minAge: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "age",
      minAge,
      (value: any, minAge: number) => {
        if (!(value instanceof Date)) return { isOk: false };
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return { isOk: age >= minAge };
      },
      failedMessage ? failedMessage : `Must be at least ${minAge} years old`,
    );
    return this;
  }

  private getDayName(day: number): string {
    return new Intl.DateTimeFormat(this.config.defaultLocale, {
      weekday: "long",
    }).format(new Date(2024, 0, day + 1));
  }
}

export { DateZod };
export type { DateConfig, DateFormat };
