import db from "../lib/database";
import { categoryTable } from "../lib/database/schema";
import { normalizeString } from "../lib";
import { eq, getTableColumns } from "drizzle-orm";

const { normalizedName, ...columns } = getTableColumns(categoryTable);

export async function getCategories() {
  return db.select({ ...columns }).from(categoryTable);
}

export async function getCategoryById(searchParams: { id: string }) {
  const { id } = searchParams;

  const categories = await db
    .select({ ...columns })
    .from(categoryTable)
    .where(eq(categoryTable.id, id))
    .limit(1);

  return categories.at(0);
}

export async function createCategory(data: {
  name: string;
  description: string | null;
}) {
  try {
    const { name, description } = data;

    const categories = await db
      .insert(categoryTable)
      .values({
        name,
        description,
        normalizedName: normalizeString(name),
      })
      .returning({ ...columns });

    return categories.at(0);
  } catch (error) {
    console.log("Error at createCategory():", error);

    return;
  }
}
