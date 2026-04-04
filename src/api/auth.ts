import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "../auth.js";
import { respondWithJSON } from "./json.js";
import { UserNotAuthenticatedError } from "./errors.js";

import type { Request, Response } from "express";
import type { UserResponse } from "./users.js";
import { config } from "../config.js";
import { refresh_tokens, RefreshToken } from "src/db/schema.js";
import { db } from "src/db/index.js";

type LoginResponse = UserResponse & {
  token: string;
  refreshToken: string;
};

export async function handlerLogin(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };

  const params: parameters = req.body;

  const user = await getUserByEmail(params.email);
  if (!user) {
    throw new UserNotAuthenticatedError("incorrect email or password");
  }

  const matching = await checkPasswordHash(
    params.password,
    user.hashedPassword,
  );
  if (!matching) {
    throw new UserNotAuthenticatedError("incorrect email or password");
  }

  let duration = config.jwt.defaultDuration;
//  if (params.expiresIn && !(params.expiresIn > config.jwt.defaultDuration)) {
//    duration = params.expiresIn;
//  }
//
  const accessToken = makeJWT(user.id, duration, config.jwt.secret);
  const refreshToken = makeRefreshToken();
  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const ref_token: RefreshToken = {
    user_id: user.id,
    token: refreshToken,
    revoked_at: null,
    expires_at: expiresAt,
  }

  const insert = await inserToken(ref_token);

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: accessToken,
    refreshToken: refreshToken,
  } satisfies LoginResponse);
}

async function inserToken(ref_token: RefreshToken) {
  const [result] = await db
    .insert(refresh_tokens)
    .values(ref_token)
    .onConflictDoNothing()
    .returning();
  return result;
}
