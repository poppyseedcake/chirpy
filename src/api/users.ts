import type { Request, Response } from "express";
import type { NewUser } from "src/db/schema.js";

import { respondWithJSON, respondWithError } from "./json.js";
import { BadRequestError, UserForbiddenError } from "./errors.js";
import { createUser } from "../db/queries/users.js";
import { config } from "../config.js";

export async function handlerCreateUser(req: Request, res: Response) {

    if(config.api.platform != "dev") {
        throw new UserForbiddenError("Can delete user table on prod.")
    }
  const email = req.body;

  if (email.email.length == 0) {
    throw new BadRequestError(
        `Provide email.`,
      );
  }

  const user = await createUser(email);


  respondWithJSON(res, 201, user);
}
