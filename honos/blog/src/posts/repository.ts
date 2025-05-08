import db from "../lib/database";
import { categoryTable, postTable } from "../lib/database/schema";
import { normalizeString } from "../lib";
import { eq, getTableColumns } from "drizzle-orm";

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

  const posts = await db
    .select({
      ...columns,
      category: categoryTable.name,
      categoryId,
    })
    .from(postTable)
    .leftJoin(categoryTable, eq(postTable.categoryId, categoryTable.id))
    .where(eq(postTable.id, id))
    .limit(1);

  return posts.at(0);
}

export async function createPost(data: {
  title: string;
  content: string;
  categoryId: string;
  published?: boolean;
}) {
  try {
    const { title, content, categoryId, published = false } = data;

    const posts = await db
      .insert(postTable)
      .values({
        title,
        content,
        normalizedTitle: normalizeString(title),
        published,
        categoryId,
      })
      .returning({
        ...columns,
        category: categoryTable.name,
      });

    return posts.at(0);
  } catch (error) {
    console.log("Error at createPost():", error);

    return;
  }
}

export async function updatePost(
  searchParams: { id: string },
  data: {
    title: string;
    content: string;
    categoryId: string;
    published?: boolean | null;
  }
) {
  try {
    const { id } = searchParams;

    const { title, content, categoryId, published } = data;

    const posts = await db
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
        ...columns,
        category: categoryTable.name,
      });

    return posts.at(0);
  } catch (error) {
    console.log("Error at updatePost():", error);

    return;
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
