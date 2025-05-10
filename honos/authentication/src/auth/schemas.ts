import { z } from "zod";
import { userTable } from "../db/schemas";
import { createInsertSchema } from "drizzle-zod";

export const registerSchema = createInsertSchema(userTable, {
  email: z.string().email(),
  password: z.string().min(8), // TODO: add check complex (example: min 1 special char)
  firstName: z.string().min(1, "required"),
  lastName: z.string().min(1, "required"),
}).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  updatedAt: true,
  username: true,
});

export const emailSchema = z.object({ email: z.string().email() });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "required"),
});
