import type { DatabaseError } from "pg-protocol";

import db from "../lib/database";
import { categoryTable } from "../lib/database/schema";
import { logDbError } from "../lib/database/error";
import { normalizeString } from "../lib";
import { eq, getTableColumns } from "drizzle-orm";
import slug from "slug";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { ContentfulStatusCode } from "hono/utils/http-status";

const { normalizedName, ...columns } = getTableColumns(categoryTable);

export async function getCategories() {
  return db.select({ ...columns }).from(categoryTable);
}

export async function getCategoryById(searchParams: { id: string }) {
  const { id } = searchParams;

  try {
    const [category] = await db
      .select({ ...columns })
      .from(categoryTable)
      .where(eq(categoryTable.id, id))
      .limit(1);

    return {
      data: category,
      error: null,
    };
  } catch (e) {
    const error = e as DatabaseError;

    logDbError(getCategoryById, error);

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

export async function createCategory(data: {
  name: string;
  description: string | null;
}) {
  const { name, description } = data;

  try {
    const [category] = await db
      .insert(categoryTable)
      .values({
        name,
        description,
        normalizedName: normalizeString(name),
        slug: slug(name),
      })
      .returning({ ...columns });

    return {
      data: category,
      error: null,
    };
  } catch (e) {
    const error = e as DatabaseError;

    logDbError(createCategory, error);

    if (error.code === "23505")
      return {
        data: null,
        error: {
          title: ReasonPhrases.CONFLICT,
          status: StatusCodes.CONFLICT as ContentfulStatusCode,
          detail: `Category '${name}' existed`,
        },
      };

    return {
      data: null,
      error: {
        title: ReasonPhrases.UNPROCESSABLE_ENTITY,
        status: StatusCodes.UNPROCESSABLE_ENTITY as ContentfulStatusCode,
        detail: "Cannot create category",
      },
    };
  }
}
