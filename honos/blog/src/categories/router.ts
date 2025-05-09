import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { categoryIdSchema, categorySchema } from "./schema";
import { createCategory, getCategories, getCategoryById } from "./repository";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

const app = new Hono()
  .get("/", async (c) => {
    const categories = await getCategories();

    return c.json({
      categories,
    });
  })
  .get(
    "/:id",
    zValidator("param", categoryIdSchema, (result, c) => {
      if (!result.success)
        return c.json(
          {
            title: ReasonPhrases.BAD_REQUEST,
            status: StatusCodes.BAD_REQUEST,
            detail: "Invalid id",
          },
          StatusCodes.BAD_REQUEST
        );
    }),
    async (c) => {
      const { id } = c.req.valid("param");

      const { data: category, error } = await getCategoryById({ id });

      if (error) return c.json(error, error.status);

      if (!category)
        return c.json(
          {
            title: ReasonPhrases.NOT_FOUND,
            status: StatusCodes.NOT_FOUND,
            detail: `Category with id '${id}' not found`,
          },
          StatusCodes.NOT_FOUND
        );

      return c.json({
        category,
      });
    }
  )
  .post(
    "/",
    zValidator("json", categorySchema, (result, c) => {
      if (!result.success)
        return c.json(
          {
            status: StatusCodes.BAD_REQUEST,
            title: ReasonPhrases.BAD_REQUEST,
            detail: "Validation error",
            errors: result.error.errors.map((e) => ({
              code: e.code,
              message: e.message,
              path: e.path.join("."),
            })),
          },
          StatusCodes.BAD_REQUEST
        );
    }),
    async (c) => {
      const { name, description } = c.req.valid("json");

      const { data: category, error } = await createCategory({
        name,
        description: description ?? null,
      });

      if (error) return c.json(error, error.status);

      return c.json({
        category,
      });
    }
  );

export default app;
