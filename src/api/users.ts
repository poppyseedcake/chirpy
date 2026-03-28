import type { Request, Response } from "express";

import { createUser, getUserByMail } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { checkPasswordHash, hashPassword } from "./auth.js";

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };
  const params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const hash = await hashPassword(params.password);
  const user = await createUser({ email: params.email, hashed_password: hash});

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

export async function handlerUserLogin(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };
  const params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await getUserByMail(params.email);
  if (!user) {
    throw new Error("User not found.");
  }

  const check = checkPasswordHash(params.password, user.hashed_password);
  if (!check) {
    respondWithError(res, 401, "incorrect email or password");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email
  })

}
