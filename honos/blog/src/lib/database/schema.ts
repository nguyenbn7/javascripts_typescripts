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
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    normalizedName: varchar("normalized_name", { length: 255 })
      .notNull()
      .unique(),
    slug: varchar({ length: 255 }).notNull().unique(),
    description: text(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("name_idx").on(table.normalizedName),
    uniqueIndex("slug_category_idx").on(table.slug),
  ]
);

export const categoryRelations = relations(categoryTable, ({ many }) => ({
  posts: many(postTable),
}));

export const postTable = pgTable(
  "post",
  {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    normalizedTitle: varchar("normalized_title", { length: 255 })
      .notNull()
      .unique(),
    slug: varchar({ length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
    published: boolean().default(false),
    content: text().notNull(),
    categoryId: uuid("category_id").references(() => categoryTable.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("title_idx").on(table.normalizedTitle),
    uniqueIndex("slug_post_idx").on(table.slug),
  ]
);

export const postRelations = relations(postTable, ({ one }) => ({
  category: one(categoryTable, {
    fields: [postTable.categoryId],
    references: [categoryTable.id],
  }),
}));
