// deno-lint-ignore-file no-explicit-any

type ValidationError = {
  message: string;
  key?: string;
  from?: 'query' | 'body' | 'formData';
};

type RuleResult = { isOk: boolean; newValue?: any };
type Rule = (...params: any[]) => RuleResult;
type FailedMessage = string | ((...params: any[]) => string | string[]);
type ValidateResult = { isOk: boolean; value: any; errors: ValidationError[] };

type ValidationRule = {
  title: string;
  rule: Rule;
  failedMessage?: FailedMessage;
  isTransformer?: boolean; // Added this flag
};

type UnknownObject = Record<string, YelixValidationBase>;

type ValidateConfig = {
  prefix?: string | ((prefix: string) => string);
  key?: string;
};

class YelixValidationBase {
  protected rules: ValidationRule[] = [];
  getType: 'get' | 'getAll' = 'get';

  protected removeRule(title: string) {
    this.rules = this.rules.filter((r) => r.title !== title);
  }

  addRule(
    title: string,
    rule: Rule,
    failedMessage?: FailedMessage,
    isTransformer?: boolean
  ) {
    this.rules.push({
      title,
      rule,
      failedMessage,
      isTransformer,
    });
  }

  validate(value: any, config?: ValidateConfig): ValidateResult {
    const errors: string[] = [];
    let currentValue = value;

    // First run transformers
    for (const rule of this.rules.filter((r) => r.isTransformer)) {
      const result = rule.rule(currentValue);
      if (!result.isOk) {
        let message: string | string[] =
          typeof rule.failedMessage === 'function'
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
      const result = rule.rule(currentValue);
      if (!result.isOk) {
        let message: string | string[] =
          typeof rule.failedMessage === 'function'
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

    let keyPrefix = '';
    if (config?.key) {
      keyPrefix = `[${config.key}]`;
    }

    const exec =
      typeof config?.prefix === 'function'
        ? config?.prefix('')
        : config?.prefix;
    const customPrefix = exec ? exec : '';

    let pref = '';
    if (keyPrefix) pref += keyPrefix;
    if (customPrefix) pref += customPrefix;

    return {
      isOk: errors.length === 0,
      value: currentValue,
      errors: errors.map((err) => ({ message: err, key: pref })),
    };
  }
}

export { YelixValidationBase };
export type { FailedMessage, Rule, RuleResult, ValidateResult, UnknownObject, ValidationError };
