import type { DatabaseError } from "pg-protocol";

import db from "../lib/database";
import { categoryTable, postTable } from "../lib/database/schema";
import { logDbError } from "../lib/database/error";
import { normalizeString } from "../lib";
import { eq, getTableColumns } from "drizzle-orm";
import slug from "slug";

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

type GetPostByIdErrorCode = "post_not_found" | "cannot_get_post";

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

    const post = posts.at(0);

    if (!post) {
      const error = new Error("Post Not Found") as DatabaseError;
      error.code = "22P02";
      throw error;
    }

    return {
      data: post,
      errorCode: null,
    };
  } catch (e) {
    const error = e as DatabaseError;

    logDbError(getPostById, error);

    const result: { data: null; errorCode: GetPostByIdErrorCode } = {
      data: null,
      errorCode: "cannot_get_post",
    };

    switch (error.code) {
      case "22P02":
        result.errorCode = "post_not_found";
        break;
      default:
        break;
    }

    return result;
  }
}

type CreatePostErrorCode =
  | "duplicate_post_title"
  | "category_not_found"
  | "cannot_create_post";

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
        errorCode: null,
      };
    }

    return {
      data: { ...post, category: null },
      errorCode: null,
    };
  } catch (e) {
    const error = e as DatabaseError;

    logDbError(createPost, error);

    const result: { data: null; errorCode: CreatePostErrorCode } = {
      data: null,
      errorCode: "cannot_create_post",
    };

    switch (error.code) {
      case "23505":
        result.errorCode = "duplicate_post_title";
        break;
      case "23503":
      case "22P02":
        result.errorCode = "category_not_found";
        break;
      default:
        break;
    }

    return result;
  }
}

type UpdatePostErrorCode =
  | "cannot_update_post"
  | "category_not_found"
  | "duplicate_post_title";

export async function updatePost(
  searchParams: { id: string },
  data: {
    title: string;
    content: string;
    categoryId: string | null;
    published: boolean | null;
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
        slug: slug(title),
        categoryId: categoryId ?? null,
      })
      .where(eq(postTable.id, id))
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
        errorCode: null,
      };
    }

    return {
      data: { ...post, category: null },
      errorCode: null,
    };
  } catch (e) {
    const error = e as DatabaseError;

    logDbError(updatePost, error);

    const result: { data: null; errorCode: UpdatePostErrorCode } = {
      data: null,
      errorCode: "cannot_update_post",
    };

    switch (error.code) {
      case "23505":
        result.errorCode = "duplicate_post_title";
        break;
      case "23503":
      case "22P02":
        result.errorCode = "category_not_found";
        break;
      default:
        break;
    }

    return result;
  }
}

type DeletePostErrorCode = "post_not_found" | "cannot_delete_post";

export async function deletePost(searchParams: { id: string }) {
  const { id } = searchParams;

  try {
    const posts = await db
      .delete(postTable)
      .where(eq(postTable.id, id))
      .returning({ id: postTable.id });

    const post = posts.at(0);

    if (!post) {
      const error = new Error("Post Not Found") as DatabaseError;
      error.code = "22P02";
      throw error;
    }

    return {
      data: post,
      errorCode: null,
    };
  } catch (e) {
    const error = e as DatabaseError;

    logDbError(deletePost, error);

    const result: { data: null; errorCode: DeletePostErrorCode } = {
      data: null,
      errorCode: "cannot_delete_post",
    };

    switch (error.code) {
      case "22P02":
        result.errorCode = "post_not_found";
        break;

      default:
        break;
    }

    return result;
  }
}
