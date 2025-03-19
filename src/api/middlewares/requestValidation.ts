// deno-lint-ignore-file no-explicit-any
import type { ZodType } from "zod";
import type { Middleware, YelixValidationBase } from "@/mod.ts";

const requestDataValidationMiddleware: Middleware = async (request) => {
  const zod = request.endpoint?.exports?.validation;

  if (!zod) {
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

  const queryModal = zod?.query;
  if (queryModal) {
    const queries = Object.keys(queryModal);
    for (const key of queries) {
      const value = request.ctx.req.query(key);
      const zv = queryModal[key];
      if (zv) {
        if (
          zv?.constructor?.name === "ZodType" ||
          zv?.constructor?.name === "ZodString"
        ) {
          const parsed = (zv as ZodType<any, any, any>).safeParse(value);
          query[key] = parsed.data;
          const parsedErrors = JSON.parse(parsed.error?.message || "{}");
          if (!parsed.success) {
            parsedErrors.forEach((error: { message: string }) => {
              errors.push({
                message:
                  `Invalid query parameter for '${key}', ${error.message}`,
              });
            });
          }
        } else {
          console.error(
            "INTERNAL API VALIDATION ERROR " +
              "(Path: " +
              request.endpoint?.path +
              ")" +
              ", Invalid query parameter for",
            key,
            zv,
            zv?.constructor?.name,
          );
        }
      }
    }
  }

  const bodyModal = zod?.body;
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
      const parsed = bodyModal.safeParse(bodyData);
      const parsedErrors = JSON.parse(parsed.error?.message || "{}");
      body = parsed.data;
      if (!parsed.success) {
        parsedErrors.forEach(
          (error: {
            code: string;
            expected: string;
            received: string;
            path: string[];
            message: string;
          }) => {
            const getMessage = () => {
              if (error.code === "invalid_type") {
                return `[${error.code}] Expected ${error.expected} but received ${error.received}. message: ${error.message}`;
              } else {
                return `[${error.code}] ${error.message}`;
              }
            };

            errors.push({
              message:
                `Invalid body property for '${error.path}'. ${getMessage()}`,
            });
          },
        );
      }
    }
  }

  const formDataModal:
    | {
      [key: string]: YelixValidationBase;
    }
    | undefined = zod?.formData;
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
    const keys = Object.keys(formDataModal);

    for (const key of keys) {
      const validater = formDataModal[key];

      const getType = validater.getType;
      const data = getType === "get"
        ? formDatas.get(key)
        : formDatas.getAll(key);
      const parsed = validater.validate(data);

      if (parsed.errors.length > 0) {
        errors.push({
          message: `Invalid form data for '${key}', ${
            parsed.errors.join(
              ", ",
            )
          }`,
        });
      }

      formData[key] = parsed.value;
    }
  }

  if (errors.length > 0) {
    return {
      base: {
        responseStatus: "end",
        status: 400,
        body: JSON.stringify({ errors }),
      },
    };
  }

  return {
    base: {},
    user: {
      query,
      body,
      formData,
    },
  };
};

export { requestDataValidationMiddleware };
