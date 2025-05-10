import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { validateSession } from "../auth/middlewares";
import { getFullName } from "../lib";
import { createResouceSchema } from "./schemas";
import { createResource, getResources } from "./service";

const app = new Hono()
  .get("/", validateSession, async (c) => {
    const { firstName, lastName, id: userId } = c.get("user");

    return c.json({
      data: {
        owner: getFullName(firstName, lastName),
        resources: await getResources(userId),
      },
    });
  })
  .post(
    "/",
    validateSession,
    zValidator("json", createResouceSchema),
    async (c) => {
      const { id: userId } = c.get("user");
      const { name } = c.req.valid("json");

      const resource = await createResource(userId, { name });

      return c.json({
        data: resource,
      });
    }
  );

export default app;
