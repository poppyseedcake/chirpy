import type { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerResetMetric(req:Request, res:Response) {
    config.fileserverHits = 0;
    res.send("Metrics reseted");
}