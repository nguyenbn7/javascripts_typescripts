import { Hono } from "hono";

import categories from "./categories/router";
import posts from "./posts/router";

const app = new Hono().route("/categories", categories).route("/posts", posts);

export default app;
