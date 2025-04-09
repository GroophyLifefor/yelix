// deno-lint-ignore-file no-explicit-any

type ValidationError = {
  message: string;
  key?: string;
  from?: "query" | "body" | "formData";
};

type RuleResult = { isOk: boolean; newValue?: any };
type Rule = (...params: any[]) => RuleResult;
type FailedMessage = string | ((...params: any[]) => string | string[]);
type ValidateResult<T = any> = {
  isOk: boolean;
  value: T;
  errors: ValidationError[];
  validatorInstance: AbstractValidationBase<T>;
};

type ValidationRule = {
  title: string;
  rule: Rule;
  value: any;
  failedMessage?: FailedMessage;
  isTransformer?: boolean; // Added this flag
};

type UnknownObject = Record<string, YelixValidationBase<any>>;

type ValidateConfig = {
  prefix?: string | ((prefix: string) => string);
  key?: string;
};

abstract class AbstractValidationBase<T = any> {
  abstract rules: ValidationRule[];
  abstract type: string;
  abstract getType: "get" | "getAll";
  
  protected abstract removeRule(title: string): void;
  abstract hasRule(title: string): boolean;
  abstract addRule(
    title: string,
    value: any,
    rule: Rule,
    failedMessage?: FailedMessage,
    isTransformer?: boolean,
    addToFirst?: boolean,
  ): this;
  abstract addRules(rules: ValidationRule[]): this;
  abstract validate(value: any, config?: ValidateConfig): ValidateResult<T>;
}

class YelixValidationBase<T = any> extends AbstractValidationBase<T> {
  rules: ValidationRule[] = [];
  type: string = "not_set";
  getType: "get" | "getAll" = "get";

  protected removeRule(title: string) {
    this.rules = this.rules.filter((r) => r.title !== title);
  }

  hasRule(title: string): boolean {
    return this.rules.some((r) => r.title === title);
  }

  addRule(
    title: string,
    value: any,
    rule: Rule,
    failedMessage?: FailedMessage,
    isTransformer?: boolean,
    addToFirst: boolean = false,
  ): this {
    if (addToFirst) {
      this.rules.unshift({
        title,
        value,
        rule,
        failedMessage,
        isTransformer,
      });
      return this;
    }

    this.rules.push({
      title,
      value,
      rule,
      failedMessage,
      isTransformer,
    });
    return this;
  }

  addRules(rules: ValidationRule[]): this {
    this.rules.push(...rules);
    return this;
  }

  validate(value: any, config?: ValidateConfig): ValidateResult<T> {
    const errors: string[] = [];
    let currentValue = value;

    // First run transformers
    for (const rule of this.rules.filter((r) => r.isTransformer)) {
      const result = rule.rule(currentValue, rule.value);
      if (!result.isOk) {
        const message: string | string[] =
          typeof rule.failedMessage === "function"
            ? rule.failedMessage({
              value: currentValue,
              result,
            })
            : rule.failedMessage || `Validation failed for ${rule.title}`;

        if (Array.isArray(message)) {
          errors.push(...message);
        } else {
          errors.push(message);
        }
      }
      if (result.newValue !== undefined) {
        currentValue = result.newValue;
      }
    }

    // Then run validators
    for (const rule of this.rules.filter((r) => !r.isTransformer)) {
      const result = rule.rule(currentValue, rule.value);
      if (!result.isOk) {
        const message: string | string[] =
          typeof rule.failedMessage === "function"
            ? rule.failedMessage({
              value: currentValue,
              result,
            })
            : rule.failedMessage || `Validation failed for ${rule.title}`;

        if (Array.isArray(message)) {
          errors.push(...message);
        } else {
          errors.push(message);
        }
      }
      if (result.newValue !== undefined) {
        currentValue = result.newValue;
      }
    }

    let keyPrefix = "";
    if (config?.key) {
      keyPrefix = `[${config.key}]`;
    }

    const exec = typeof config?.prefix === "function"
      ? config?.prefix("")
      : config?.prefix;
    const customPrefix = exec ? exec : "";

    let pref = "";
    if (keyPrefix) pref += keyPrefix;
    if (customPrefix) pref += customPrefix;

    return {
      isOk: errors.length === 0,
      value: currentValue as T,
      errors: errors.map((err) => ({ message: err, key: pref })),
      validatorInstance: this,
    };
  }
}

export { YelixValidationBase, AbstractValidationBase };
export type {
  FailedMessage,
  Rule,
  RuleResult,
  UnknownObject,
  ValidateConfig,
  ValidateResult,
  ValidationError,
};
