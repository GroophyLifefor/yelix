// deno-lint-ignore-file no-explicit-any

type RuleResult = { isOk: boolean; newValue?: any };
type Rule = (...params: any[]) => RuleResult;
type FailedMessage = string | ((...params: any[]) => string);
type ValidateResult = { isOk: boolean; value: any; errors: string[] };

type ValidationRule = {
  title: string;
  rule: Rule;
  failedMessage?: FailedMessage;
};

class YelixValidationBase {
  protected rules: ValidationRule[] = [];
  getType: "get" | "getAll" = "get";

  addRule(title: string, rule: Rule, failedMessage?: FailedMessage) {
    this.rules.push({
      title,
      rule,
      failedMessage,
    });
  }

  validate(value: any): ValidateResult {
    const errors: string[] = [];
    let currentValue = value;

    for (const rule of this.rules) {
      const result = rule.rule(currentValue);
      if (!result.isOk) {
        const message = typeof rule.failedMessage === "function"
          ? rule.failedMessage(currentValue)
          : rule.failedMessage || `Validation failed for ${rule.title}`;
        errors.push(message);
      }
      if (result.newValue !== undefined) {
        currentValue = result.newValue;
      }
    }

    return {
      isOk: errors.length === 0,
      value: currentValue,
      errors,
    };
  }
}

export { YelixValidationBase };
export type { FailedMessage, Rule, RuleResult, ValidateResult };
