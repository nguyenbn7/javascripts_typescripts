import type { InferInsertModel } from "drizzle-orm";
import type { userTable } from "../db/schemas";

import db from "../db";
import { jwtVerify, SignJWT } from "jose";
import { HS512 } from "./constants/jws.alg";

const { APP_NAME, SECRET } = process.env;

export function getExpiresAt(seconds: number = 3600 /** 1 hour */) {
  const expiresAtMillis = Date.now() + seconds * 1000;
  return new Date(expiresAtMillis);
}

export function getSecret() {
  if (!SECRET) throw new Error("Cannot find SECRET");
  return new TextEncoder().encode(SECRET);
}

type User = InferInsertModel<typeof userTable>;

export async function generateAccessToken(
  user: User,
  expiresAt: Date,
  jwsAlg: string = HS512,
  secret: Uint8Array = getSecret()
) {
  try {
    return new SignJWT({
      sub: user.id?.toString(),
      iss: APP_NAME,
      aud: APP_NAME,
    })
      .setProtectedHeader({ alg: jwsAlg })
      .setIssuedAt()
      .setExpirationTime(expiresAt)
      .sign(secret);
  } catch (error) {
    console.log("generateAccessToken():", error);
  }
}

export async function validateAccessToken(
  token: string,
  secret: Uint8Array = getSecret()
) {
  try {
    const verifiedToken = await jwtVerify(token, secret, {
      issuer: APP_NAME,
      audience: APP_NAME,
    });

    const userIdStr = verifiedToken.payload.sub;
    if (!userIdStr) return;

    if (!/^\d+$/.test(userIdStr)) return;

    const userId = Number(userIdStr);

    return db
      .selectFrom("user as u")
      .where("u.id", "=", userId)
      .select([
        "u.id",
        "u.username",
        "u.email",
        "u.first_name as firstName",
        "u.last_name as lastName",
        "u.created_at as createdAt",
        "u.updated_at as updatedAt",
        "u.last_login as lastLogin",
      ])
      .executeTakeFirst();
  } catch (err) {
    console.error("validateAccessToken():", err);
  }
}
