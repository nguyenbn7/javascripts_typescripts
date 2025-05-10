import { z } from "zod";
import { resouceTable } from "../db/schemas";
import { createInsertSchema } from "drizzle-zod";

export const createResouceSchema = createInsertSchema(resouceTable, {
  name: z.string().min(1, "required"),
}).omit({ id: true, userId: true });
