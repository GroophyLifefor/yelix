// deno-lint-ignore-file no-explicit-any
import type {
  Ctx,
  Middleware,
  ValidationError,
  ValidationType,
} from "@/mod.ts";

export function getValidatedBody<T>(
  ctx: Ctx,
  defaultValue: T | null = null,
): T {
  const data = ctx.get("dataValidation")?.user?.body;
  return data !== undefined ? data : defaultValue;
}

export function getValidatedQuery<T>(
  ctx: Ctx,
  defaultValue: T | null = null,
): T {
  const data = ctx.get("dataValidation")?.user?.query;
  return data !== undefined ? data : defaultValue;
}

export function getValidatedFormData<T>(
  ctx: Ctx,
  defaultValue: T | null = null,
): T {
  const data = ctx.get("dataValidation")?.user?.formData;
  return data !== undefined ? data : defaultValue;
}

function lookNewKey(key: string, msg: any): { key: string; message: string } {
  if (typeof msg === "object" && msg !== null) {
    const newKey = key + (key.length === 0 ? "" : ".") + (msg.key || "");
    return lookNewKey(newKey, msg.message);
  }
  return { key, message: msg };
}

const requestDataValidationYelixMiddleware: Middleware = async (request) => {
  const validation: ValidationType = request.endpoint?.exports?.validation;

  if (!validation) {
    let errorMessage = "Validation schema is not defined for this endpoint.";
    if (request.endpoint) {
      errorMessage +=
        ` Please define a validation schema in the endpoint file.${request.endpoint.path}.${request.endpoint.methods}`;
    }

    throw new Error(errorMessage);
  }

  const errors: { [key: string]: any[] } = {};
  const query: any = {};
  let body: any = {};
  const formData: any = {};

  const addError = (error: ValidationError, from: string) => {
    const key = error.key?.trim().replace(/^\[|\]$/g, "") || "unknown";
    if (!errors[key]) {
      errors[key] = [];
    }
    errors[key].push({
      message: error.message,
      key,
      from,
    });
  };

  const queryModal = validation?.query;
  if (queryModal) {
    for (const key in queryModal) {
      const value = request.ctx.req.query(key);
      const validator = queryModal[key];
      if (validator) {
        const parsed = validator.validate(value, { key });
        query[key] = parsed.value;
        if (!parsed.isOk) {
          parsed.errors.forEach((error: ValidationError) =>
            addError(error, "query")
          );
        }
      }
    }
  }

  const bodyModal = validation?.body;
  if (bodyModal) {
    let bodyData;
    try {
      bodyData = await request.ctx.req.json();
    } catch (_) {
      const HTTPMethod = request.ctx.req.method || "GET";
      const isBodyNotAllowed = ["GET", "DELETE", "OPTIONS", "HEAD"].includes(
        HTTPMethod,
      );

      if (!errors["_body"]) errors["_body"] = [];
      errors["_body"].push({
        message: "Invalid body, expected JSON." +
          (isBodyNotAllowed
            ? ` Body is not allowed for '${HTTPMethod}' method.`
            : ""),
        key: "_body",
        from: "body",
      });
    }

    if (bodyData) {
      const parsed = bodyModal.validate(bodyData);
      body = parsed.value;
      if (!parsed.isOk) {
        for (const error of parsed.errors) {
          // Handle potentially undefined key
          const initialKey = error.key || "";
          const { key, message } = lookNewKey(initialKey, error.message);

          if (!errors[key]) errors[key] = [];
          errors[key].push({
            message,
            key,
            from: "body",
          });
        }
      }
    }
  }

  const formDataModal = validation?.formData;
  let formDatas = undefined;
  if (formDataModal) {
    try {
      formDatas = await request.ctx.req.formData();
    } catch (_) {
      if (!errors["_formData"]) errors["_formData"] = [];
      errors["_formData"].push({
        message: "Invalid form data, expected form data.",
        key: "_formData",
        from: "formData",
      });
    }
  }

  if (formDataModal && formDatas) {
    for (const key in formDataModal) {
      const validator = formDataModal[key];
      const data = validator.getType === "get"
        ? formDatas.get(key)
        : formDatas.getAll(key);
      const parsed = validator.validate(data, { key });

      if (!parsed.isOk) {
        parsed.errors.forEach((error: ValidationError) =>
          addError(error, "formData")
        );
      }

      formData[key] = parsed.value;
    }
  }

  return {
    base: Object.keys(errors).length > 0
      ? {
        responseStatus: "end",
        status: 400,
        body: JSON.stringify({ errors }),
      }
      : {},
    user: {
      query,
      body,
      formData,
      validation,
    },
  };
};

export { requestDataValidationYelixMiddleware };
