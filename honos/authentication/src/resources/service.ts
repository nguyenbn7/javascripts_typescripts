import db from "../db";

export async function getResources(userId: number) {
  return db
    .selectFrom("internal_resource as ir")
    .where("ir.user_id", "=", userId)
    .select(["ir.id", "ir.name"])
    .execute();
}

export async function createResource(userId: number, data: { name: string }) {
  return db
    .insertInto("internal_resource")
    .values({
      name: data.name,
      user_id: userId,
    })
    .returning(["id", "name"])
    .execute();
}
