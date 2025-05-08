import { Hono } from "hono";
import { requestId } from "hono/request-id";

import categories from "./categories/router";
import posts from "./posts/router";

const app = new Hono()
  .use(requestId())
  .route("/categories", categories)
  .route("/posts", posts);

export default app;
