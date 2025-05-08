import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "required"),
  description: z.string().optional(),
});

export const categoryIdSchema = z.object({
  id: z.string().min(1, "Required"),
});
