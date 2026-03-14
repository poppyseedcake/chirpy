import type { Request, Response } from "express";

import { respondWithJSON, respondWithError } from "./json.js";

export async function handlerChirpsValidate(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;

    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
      respondWithError(res, 400, "Chirp is too long");
      return;
    }

    const [ hasProfane, newBody ] = hasProfaneWords(params.body);
    //if (hasProfane) {
        respondWithJSON(res, 200, {
            "cleanedBody": newBody,
        })
      //  return
    //}

    //respondWithJSON(res, 200, {
    //  valid: true,
    //});
}

function hasProfaneWords(reqBody: any) {
    let hasProfane: boolean = false;
    const profaneWords = ["kerfuffle", "sharbert", "fornax"];
    const censure = "****";
    const bodySplitLowerCase = reqBody.toLowerCase().split(" ");
    const bodySplit = reqBody.split(" ");
    for (const profaneWord of profaneWords) {
        if (bodySplitLowerCase.includes(profaneWord)) {
            const i = bodySplitLowerCase.indexOf(profaneWord);
            bodySplit[i] = censure;
            hasProfane = true;
        }
    }
    const newBody = bodySplit.join(" ");
    console.log(newBody);
    return [ hasProfane, newBody ]

}