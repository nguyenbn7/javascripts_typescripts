import { z } from "zod";

export const postSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().min(1),
  categoryId: z.string().min(1),
  published: z.boolean().default(false),
});

export const postIdSchema = z.object({
  id: z.string().min(1, "Required"),
});
