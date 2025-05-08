import { relations, sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const categoryTable = pgTable(
  "category",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    normalizedName: varchar("normalized_name", { length: 255 })
      .notNull()
      .unique(),
    description: text(),
  },
  (table) => [uniqueIndex("name_idx").on(table.normalizedName)]
);

export const categoryRelations = relations(categoryTable, ({ many }) => ({
  posts: many(postTable),
}));

export const postTable = pgTable(
  "post",
  {
    id: uuid().defaultRandom().primaryKey(),
    title: varchar({ length: 255 }).notNull(),
    normalizedTitle: varchar("normalized_title", { length: 255 })
      .notNull()
      .unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => sql`now()`),
    published: boolean().default(false),
    content: text().notNull(),
    categoryId: varchar({ length: 255 }).notNull(),
  },
  (table) => [uniqueIndex("title_idx").on(table.normalizedTitle)]
);

export const postRelations = relations(postTable, ({ one }) => ({
  category: one(categoryTable, {
    fields: [postTable.categoryId],
    references: [categoryTable.id],
  }),
}));
