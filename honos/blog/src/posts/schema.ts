import { z } from "zod";

export const postSchema = z.object({
  title: z.string().trim().min(1, "Required").max(255, "Maximum length is 255"),
  content: z.string().min(1),
  categoryId: z.string().uuid().optional().nullable().default(null),
  published: z.boolean().default(false),
});

export const postIdSchema = z.object({
  id: z.string().uuid("Invalid format"),
});
