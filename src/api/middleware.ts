import type { Request, Response, NextFunction} from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";

export async function middlewareLogResponses(req:Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
    const status_code = res.statusCode;

    if (status_code >= 300) {
        console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${status_code}`);
    }
    });

    next();
}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileServerHits += 1;
    next();
  }

export function errorMiddleWare(
    err: Error,
    _: Request,
    res: Response,
    __: NextFunction,
  ) {
    let statusCode = 500;
    let message = "Something went wrong on our end";
  
    console.log(err.message);
  
    respondWithError(res, statusCode, message);
}