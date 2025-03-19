import type {
  CORSOptions,
  CORSParams,
  Ctx,
  Endpoint,
  Middleware,
  ValidationType,
} from "@/src/types/types.d.ts";
import { requestDataValidationMiddleware } from "./src/api/middlewares/requestValidation.ts";
import { Yelix } from "@/src/core/Yelix.ts";
import { simpleLoggerMiddeware } from "@/src/api/middlewares/simpleLogger.ts";
import { YelixCache } from "@/src/utils/cache.ts";
import type { OpenAPIDoc } from "@/src/OpenAPI/index.ts";
import {
  type InferYelixSchema,
  inp,
  YelixInput,
} from "@/src/validation/inp.ts";
import {
  type FailedMessage,
  type Rule,
  type RuleResult,
  YelixValidationBase,
} from "@/src/validation/ValidationBase.ts";

export {
  type CORSOptions,
  type CORSParams,
  // types
  type Ctx,
  type Endpoint,
  inp,
  type Middleware,
  type OpenAPIDoc,
  // middlewares
  requestDataValidationMiddleware,
  simpleLoggerMiddeware,
  type ValidationType,
  // classes
  Yelix,
  YelixCache,
  YelixInput,
  YelixValidationBase,
};
export type { FailedMessage, InferYelixSchema, Rule, RuleResult };
