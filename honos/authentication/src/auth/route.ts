import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import { ACCESS_TOKEN } from "./constants";
import { loginSchema, registerSchema } from "./schemas";
import { generateAccessToken, getExpiresAt } from "./service";
import {
  checkPassword,
  createUser,
  existUser,
  getUserByUsername,
  updateLastLogin,
} from "./users-manager";

const app = new Hono()
  .post("/register", zValidator("json", registerSchema), async (c) => {
    const { email, password, firstName, lastName } = c.req.valid("json");

    const existedUser = await existUser(email);

    if (existedUser) return c.json({ message: "User existed" }, 400);

    const user = await createUser({ email, firstName, lastName }, password);

    if (!user) return c.json({ message: "Cannot create user" }, 400);

    const expiresAt = getExpiresAt();
    const accessToken = await generateAccessToken(user, expiresAt);

    if (!accessToken)
      return c.json({ message: "Something went wrong. I'm a teapot" }, 418);

    setCookie(c, ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: true,
      expires: expiresAt,
      path: "/",
    });

    updateLastLogin(user.id);

    return c.json({
      login: true,
    });
  })
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");
    const user = await getUserByUsername(email);

    if (!user) return c.json({ message: "Unauthorized" }, 401);

    const passwordsAreSame = await checkPassword(password, user.password);

    if (!passwordsAreSame) return c.json({ message: "Unauthorized" }, 401);

    const expiresAt = getExpiresAt();
    const accessToken = await generateAccessToken(user, expiresAt);

    if (!accessToken)
      return c.json({ message: "Something went wrong. I'm a teapot" }, 418);

    setCookie(c, ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: true,
      expires: expiresAt,
      path: "/",
    });

    updateLastLogin(user.id);

    return c.json({
      login: true,
    });
  });

export default app;
