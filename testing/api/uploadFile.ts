import {
  type Ctx,
  type InferYelixSchema,
  inp,
  type OpenAPIDoc,
  type ValidationType,
} from "@/mod.ts";
import z from "zod";
import { YelixCache } from "@/src/utils/cache.ts";

export const cache = new YelixCache<string>();

// API endpoint handler
export async function POST(ctx: Ctx) {
  const requestData = ctx.get("dataValidation").user;
  const formData: FormData = requestData.formData;

  console.log("formData", formData);

  return await ctx.text("Hello world!", 200);
}

// API endpoint configs
export const path = "/api/uploadFile";
export const middlewares = ["dataValidation"];

// API endpoint data validation
export const validation = {
  formData: {
    fileName: inp().string().min(1, "File name is required"),
    file: inp()
      .file()
      .multipleFiles()
      .minFilesCount(2, "At least 2 files are required")
      .mimeType(["image/jpeg", "image/png"])
      .required("File is required"),
  },
} as const satisfies ValidationType;

type FormData = InferYelixSchema<typeof validation.formData>;

export const openAPI: OpenAPIDoc = {
  description: "Approves a pending local event request.",
  tags: ["Local Events"],
  responses: {
    200: {
      type: "application/json",
      zodSchema: z.object({
        message: z.string(),
      }),
    },
    400: {
      type: "application/json",
      zodSchema: z.object({
        message: z.string(),
        requestId: z.string(),
      }),
    },
  },
};
