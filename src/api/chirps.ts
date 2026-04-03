import type { Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import { createChirp, getChirps, getChirpById} from "../db/queries/chirps.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string;
    token: string;
  };

  const params: parameters = req.body;

  const token = getBearerToken(req);
  params.token = token;

  const userId = validateJWT(token, config.api.secret);

  const cleaned = validateChirp(params.body);
  const chirp = await createChirp({ body: cleaned, userId});

  respondWithJSON(res, 201, chirp);
}

export async function handlerChripsGetAll(req: Request, res: Response) {
  const chirps = await getChirps();
  respondWithJSON(res, 200, chirps);
}

function validateChirp(body: string) {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }

  const badWords = ["kerfuffle", "sharbert", "fornax"];
  return getCleanedBody(body, badWords);
}

function getCleanedBody(body: string, badWords: string[]) {
  const words = body.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const loweredWord = word.toLowerCase();
    if (badWords.includes(loweredWord)) {
      words[i] = "****";
    }
  }

  const cleaned = words.join(" ");
  return cleaned;
}

export async function handlerChirpById(req: Request, res: Response) {
  const chirpId = req.params.chirpId as string;
  const chirp = await getChirpById(chirpId);
  
  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }
  
  respondWithJSON(res, 200, chirp);
}