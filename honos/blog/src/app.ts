import { Hono } from "hono";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import api from "./router";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api", api);

app.notFound((c) => {
  return c.json(
    {
      title: ReasonPhrases.NOT_FOUND,
      status: StatusCodes.NOT_FOUND,
      detail: "Route not found",
    },
    StatusCodes.NOT_FOUND
  );
});

app.onError((err, c) => {
  const { requestId } = c.var;

  console.error(`Request with id '${requestId}' got error because:`, err);

  return c.json({
    title: ReasonPhrases.INTERNAL_SERVER_ERROR,
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    detail: "Something wrong with server. Maybe it burnt",
  });
});

export default app;
