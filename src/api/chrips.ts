import type { Request, Response } from "express";

import { respondWithJSON, respondWithError } from "./json.js";
import { BadRequestError } from "./errors.js";
import { createChirp } from "../db/queries/chrips.js";

export async function handlerChirps(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string;
  };

  const params: parameters = req.body;

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new BadRequestError(
        `Chirp is too long. Max length is ${maxChirpLength}`,
      );
  }

  const words = params.body.split(" ");

  const badWords = ["kerfuffle", "sharbert", "fornax"];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const loweredWord = word.toLowerCase();
    if (badWords.includes(loweredWord)) {
      words[i] = "****";
    }
  }

  const cleaned = words.join(" ");

  const newchirp = await createChirp({ body: cleaned, userId: params.userId});
  respondWithJSON(res, 201, newchirp
  );
}
