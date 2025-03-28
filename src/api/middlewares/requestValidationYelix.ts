// deno-lint-ignore-file no-explicit-any
import type {
  Middleware,
  ValidationError,
  ValidationType,
  YelixValidationBase,
} from "@/mod.ts";

const requestDataValidationYelixMiddleware: Middleware = async (request) => {
  const validation: ValidationType = request.endpoint?.exports?.validation;

  if (!validation) {
    throw new Error(
      "Validation schema is not defined for this endpoint. Please define a validation schema in the endpoint file." +
          request.endpoint?.path ||
        "" + "." ||
        "" + request.endpoint?.methods ||
        "" + ".",
    );
  }

  const errors: any = [];
  const query: any = {};
  let body: any = {};
  const formData: any = {};

  const queryModal = validation?.query;
  if (queryModal) {
    for (const key in queryModal) {
      const value = request.ctx.req.query(key);
      const validator = queryModal[key];
      if (validator) {
        const parsed = validator.validate(value, { key });
        query[key] = parsed.value;
        if (!parsed.isOk) {
          errors.push(
            ...parsed.errors.map((error: ValidationError) => ({
              message: error.message,
              from: "query",
              key: error.key,
            })),
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

      errors.push({
        message: "Invalid body, expected JSON." +
          (isBodyNotAllowed
            ? ` Body is not allowed for '${HTTPMethod}' method.`
            : ""),
      });
    }

    if (bodyData) {
      const parsed = bodyModal.validate(bodyData);
      body = parsed.value;
      if (!parsed.isOk) {
        const nerrors = [];

        for (const error of parsed.errors) {
          let key = error.key;
          let message = error.message;
          // deno-lint-ignore no-inner-declarations
          function lookNewKey(msg: any) {
            if (typeof msg === "object") {
              key += (key?.length === 0 ? "" : ".") + msg.key;
              message = msg.message;
              lookNewKey(msg.message);
            }
          }
          lookNewKey(error.message);

          nerrors.push({
            message: message,
            key: key,
            from: "body",
          });
        }

        errors.push(...nerrors);
      }
    }
  }

  const formDataModal: { [key: string]: YelixValidationBase } | undefined =
    validation?.formData;
  let formDatas = undefined;
  if (formDataModal) {
    try {
      formDatas = await request.ctx.req.formData();
    } catch (_) {
      errors.push({
        message: "Invalid form data, expected form data.",
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
        errors.push(
          ...parsed.errors.map((error: ValidationError) => ({
            message: error.message,
            from: "formData",
            key: error.key,
          })),
        );
      }

      formData[key] = parsed.value;
    }
  }

  return {
    base: errors.length > 0
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
    },
  };
};

export { requestDataValidationYelixMiddleware };
