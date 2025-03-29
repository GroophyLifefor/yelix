import { type Ctx, inp, type ValidationType } from "@/mod.ts";
import { YelixCache } from "@/src/utils/cache.ts";

export const cache = new YelixCache<string>();

// API endpoint handler
export async function POST(ctx: Ctx) {
  const requestData = ctx.get("dataValidation").user;
  const formData = requestData.formData;

  const response = {
    message: `Hello ${formData.username}!`,
    age: formData.age,
    email: formData.email,
    filesUploaded: formData.photos ? formData.photos.length : 0,
    submittedAt: formData.createdAt,
  };

  return await ctx.json(response, 200);
}

// API endpoint configs
export const path = "/api/formData";
export const middlewares = ["dataValidation"];

// API endpoint data validation
export const validation: ValidationType = {
  formData: {
    username: inp().string().min(3).max(50),
    email: inp().string().email(),
    age: inp().number().min(18).max(99),
    photos: inp().file().maxSize(5 * 1024 * 1024).maxFilesCount(3),
    createdAt: inp().date().min(new Date("2023-01-01")).max(
      new Date("2024-12-31"),
    ),
  },
};
