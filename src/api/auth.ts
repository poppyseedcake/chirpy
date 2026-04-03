import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { respondWithJSON } from "./json.js";
import { UserNotAuthenticatedError } from "./errors.js";
import jwt from "jsonwebtoken";

import type { Request, Response } from "express";
import type { UserResponse } from "./users.js";
import type { JwtPayload } from "jsonwebtoken";
import { config } from "../config.js";

export async function handlerLogin(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
    expiresInSeconds?: number;
  };

  const params: parameters = req.body;

  if (!params.expiresInSeconds || params.expiresInSeconds > 3600) {
    params.expiresInSeconds = 3600;
  }
 

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
  
  const token = makeJWT(user.id, params.expiresInSeconds, config.api.secret);

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: token,
  });
}
