import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { postIdSchema, postSchema } from "./schema";
import {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  updatePost,
} from "./repository";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

const app = new Hono()
  .get("/", async (c) => {
    const posts = await getPosts();

    return c.json({
      posts,
    });
  })
  .get(
    "/:id",
    zValidator("param", postIdSchema, (result, c) => {
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
      const { id } = c.req.param();

      const { data, error } = await getPostById({ id });

      if (error) return c.json(error, error.status);

      if (!data)
        return c.json(
          {
            status: StatusCodes.NOT_FOUND,
            title: ReasonPhrases.NOT_FOUND,
            detail: `Post with id '${id}' not found`,
          },
          StatusCodes.NOT_FOUND
        );

      const { categoryId, ...post } = data;

      return c.json({
        post,
      });
    }
  )
  .post(
    "/",
    zValidator("json", postSchema, (result, c) => {
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
      const { title, categoryId, content, published } = c.req.valid("json");

      const { data: post, error } = await createPost({
        title,
        categoryId,
        content,
        published,
      });

      if (error) {
        return c.json(error, error.status);
      }

      return c.json({
        post,
      });
    }
  )
  .put(
    "/:id",
    zValidator("param", postIdSchema, (result, c) => {
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
    zValidator("json", postSchema.partial(), (result, c) => {
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
      const { id } = c.req.valid("param");
      const { title, categoryId, content, published } = c.req.valid("json");

      const { data: existedPost, error } = await getPostById({ id });

      if (error) return c.json(error, error.status);

      if (!existedPost)
        return c.json(
          {
            status: StatusCodes.NOT_FOUND,
            title: ReasonPhrases.NOT_FOUND,
            detail: `Post with id '${id}' not found`,
          },
          StatusCodes.NOT_FOUND
        );

      const post = await updatePost(
        { id },
        {
          title: title ?? existedPost.title,
          content: content ?? existedPost.content,
          categoryId: existedPost.categoryId ?? categoryId,
          published: published ?? existedPost.published,
        }
      );

      return c.json({
        post,
      });
    }
  )
  .delete(
    "/:id",
    zValidator("param", postIdSchema, (result, c) => {
      if (!result.success)
        return c.json(
          {
            title: ReasonPhrases.BAD_REQUEST,
            status: StatusCodes.BAD_REQUEST,
            detail: "Invalid params",
          },
          StatusCodes.BAD_REQUEST
        );
    }),
    async (c) => {
      const { id } = c.req.valid("param");

      const existedPost = await getPostById({ id });

      if (!existedPost)
        return c.json(
          {
            status: StatusCodes.NOT_FOUND,
            title: ReasonPhrases.NOT_FOUND,
            detail: `Post with id '${id}' not found`,
          },
          StatusCodes.NOT_FOUND
        );

      const post = await deletePost({ id });

      return c.json({
        post,
      });
    }
  );

export default app;
