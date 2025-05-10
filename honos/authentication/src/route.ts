import { Hono } from "hono";

import auth from "./auth/route";
import resources from "./resources/route";

const app = new Hono().route("/auth", auth).route("/resources", resources);

export default app;
