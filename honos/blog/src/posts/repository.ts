import type { DatabaseError } from "pg-protocol";

import db from "../lib/database";
import { categoryTable, postTable } from "../lib/database/schema";
import { logDbError } from "../lib/database/error";
import { normalizeString } from "../lib";
import { eq, getTableColumns, sql } from "drizzle-orm";
import slug from "slug";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { ContentfulStatusCode } from "hono/utils/http-status";

const { normalizedTitle, categoryId, ...columns } = getTableColumns(postTable);

export async function getPosts() {
  return db
    .select({
      ...columns,
      category: categoryTable.name,
    })
    .from(postTable)
    .leftJoin(categoryTable, eq(postTable.categoryId, categoryTable.id));
}

export async function getPostById(searchParams: { id: string }) {
  const { id } = searchParams;

  try {
    const posts = await db
      .select({
        ...columns,
        categoryId,
        category: categoryTable.name,
      })
      .from(postTable)
      .leftJoin(categoryTable, eq(postTable.categoryId, categoryTable.id))
      .where(eq(postTable.id, id))
      .limit(1);

    return {
      data: posts.at(0),
      error: null,
    };
  } catch (e) {
    const error = e as DatabaseError;

    logDbError(getPostById, error);

    if (error.code === "22P02")
      return {
        data: null,
        error: {
          title: ReasonPhrases.BAD_REQUEST,
          status: StatusCodes.BAD_REQUEST as ContentfulStatusCode,
          detail: "Invalid id",
        },
      };

    return {
      data: null,
      error: {
        title: "Unknown",
        status: -1 as ContentfulStatusCode,
        detail: "Unknown error",
      },
    };
  }
}

export async function createPost(data: {
  title: string;
  content: string;
  categoryId?: string | null;
  published?: boolean;
}) {
  const { title, content, categoryId, published } = data;

  try {
    const [post] = await db
      .insert(postTable)
      .values({
        title,
        content,
        normalizedTitle: normalizeString(title),
        published,
        slug: slug(title),
        categoryId,
      })
      .returning({
        ...columns,
        categoryId: postTable.categoryId,
      });

    if (post.categoryId) {
      const [category] = await db
        .select({ name: categoryTable.name })
        .from(categoryTable)
        .where(eq(categoryTable.id, post.categoryId));

      return {
        data: { ...post, category: category.name },
        error: null,
      };
    }

    return {
      data: { ...post, category: null },
      error: null,
    };
  } catch (e) {
    const error = e as DatabaseError;

    logDbError(createPost, error);

    if (error.code === "23505")
      return {
        data: null,
        error: {
          title: ReasonPhrases.CONFLICT,
          status: StatusCodes.CONFLICT as ContentfulStatusCode,
          detail: `Post '${title}' existed`,
        },
      };

    if (error.code === "22P02")
      return {
        data: null,
        error: {
          title: ReasonPhrases.BAD_REQUEST,
          status: StatusCodes.BAD_REQUEST as ContentfulStatusCode,
          detail: "Invalid category id",
        },
      };

    if (error.code === "23503")
      return {
        data: null,
        error: {
          title: ReasonPhrases.NOT_FOUND,
          status: StatusCodes.NOT_FOUND as ContentfulStatusCode,
          detail: `Category with id '${categoryId}' not found`,
        },
      };

    return {
      data: null,
      error: {
        title: ReasonPhrases.UNPROCESSABLE_ENTITY,
        status: StatusCodes.UNPROCESSABLE_ENTITY as ContentfulStatusCode,
        detail: "Cannot create post",
      },
    };
  }
}

export async function updatePost(
  searchParams: { id: string },
  data: {
    title: string;
    content: string;
    categoryId?: string | null;
    published?: boolean | null;
  }
) {
  const { id } = searchParams;

  const { title, content, categoryId, published } = data;

  try {
    const [post] = await db
      .update(postTable)
      .set({
        title,
        content,
        normalizedTitle: normalizeString(title),
        published,
        categoryId,
      })
      .where(eq(postTable.id, id))
      .returning({
        id: columns.id,
      });

    return {
      data: post,
      error: null,
    };
  } catch (e) {
    const error = e as DatabaseError;

    logDbError(updatePost, error);

    if (error.code === "23505")
      return {
        data: null,
        error: {
          message: `Post '${title}' existed`,
        },
      };

    if (error.code === "22P02")
      return {
        data: null,
        error: {
          message: "Invalid category id",
        },
      };

    if (error.code === "23503")
      return {
        data: null,
        error: {
          message: `Category with id '${categoryId}' not found`,
        },
      };

    return {
      data: null,
      error: {
        message: "Unknown error",
      },
    };
  }
}

export async function deletePost(searchParams: { id: string }) {
  const { id } = searchParams;

  const posts = await db
    .delete(postTable)
    .where(eq(postTable.id, id))
    .returning({ id: postTable.id });

  return posts.at(0);
}
