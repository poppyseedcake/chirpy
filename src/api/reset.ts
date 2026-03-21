import type { Request, Response } from "express";
import { config } from "../config.js";
import { deleteUsers } from "../db/queries/users.js";

export async function handlerReset(_: Request, res: Response) {
  config.api.fileServerHits = 0;
  await deleteUsers();
  res.write("Hits reset to 0");
  res.end();
}