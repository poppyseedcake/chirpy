import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken } from "../auth.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { UserNotAuthenticatedError } from "./errors.js";

import type { Request, Response } from "express";
import type { UserResponse } from "./users.js";
import { config } from "../config.js";
import { refresh_tokens, RefreshToken } from "../db/schema.js";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";

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

  const insert = await insertToken(ref_token);

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: accessToken,
    refreshToken: refreshToken,
  } satisfies LoginResponse);
}

async function insertToken(ref_token: RefreshToken) {
  const [result] = await db
    .insert(refresh_tokens)
    .values(ref_token)
    .onConflictDoNothing()
    .returning();
  return result;
}

async function findToken(token: string) {
  const rows = await db.select().from(refresh_tokens).where(eq(refresh_tokens.token, token));
  if (rows.length === 0) {
    return;
  }
  return rows[0];
}

export async function handlerRefresh(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);

    const dbToken = await findToken(refreshToken);
    
    if (!dbToken) {
        respondWithError(res, 401, "Token not found");
        return;
    }

    if (dbToken.revoked_at != null) {
        respondWithError(res, 401, "Token revoked");
        return;
    }

    if (dbToken.expires_at != null && dbToken.expires_at < new Date) {
        respondWithError(res, 401, "Token expired");
        return;
    }

    const newAccessToken = makeJWT(dbToken.user_id, config.jwt.defaultDuration, config.jwt.secret);
    respondWithJSON(res, 200, { "token": newAccessToken});
}

export async function handlerRevoke(req: Request, res: Response) {
    const refreshToken = getBearerToken(req);
    const dbToken = await findToken(refreshToken);
    
    if (!dbToken) {
        respondWithError(res, 401, "Token not found");
        return;
    }
    if (dbToken.revoked_at != null) {
        respondWithError(res, 401, "Token already revoked");
        return;
    }
    await db
      .update(refresh_tokens)
      .set({ 
        revoked_at: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(refresh_tokens.token, refreshToken));
    res.status(204).send();
  }
