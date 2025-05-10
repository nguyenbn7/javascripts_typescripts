import type { InferSelectModel } from "drizzle-orm";
import type { userTable } from "../db/schemas";

import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { ACCESS_TOKEN } from "./constants";
import { validateAccessToken } from "./service";

type User = Omit<InferSelectModel<typeof userTable>, "password">;

interface SessionEnv {
  Variables: {
    user: User;
  };
}
export const validateSession = createMiddleware<SessionEnv>(async (c, next) => {
  const accessToken = getCookie(c, ACCESS_TOKEN);

  if (!accessToken) return c.json({ message: "Unauthorized" }, 401);

  const user = await validateAccessToken(accessToken);

  if (!user) return c.json({ message: "Unauthorized" }, 401);

  c.set("user", user);

  await next();
});
