import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { errorMiddleWare, middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerChirpsValidate } from "./api/chrips.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import { handlerUsersCreate } from "./api/users.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", async (req, res, next) => {
  try {
    await handlerReadiness(req, res);
  } catch(err) {
    next(err);
  }
});
app.get("/admin/metrics", async (req, res, next) => {
  try {
    await handlerMetrics(req, res);
  } catch(err) {
    next(err);
  }

}); 
app.post("/admin/reset", async (req, res, next) => {
  try {
    await handlerReset(req, res);
  } catch(err) {
    next(err);
  }
  });

app.post("/api/validate_chirp", (req, res, next) => {
  Promise.resolve(handlerChirpsValidate(req, res)).catch(next);
});

app.post("/api/users", async (req, res, next) => {
  try {
    await handlerUsersCreate(req, res);
  } catch(err) {
    next(err);
  }
});

app.post("/api/chirps", (req, res, next) => {
  try {
    await handlerChirps(req, res);
  } catch(err) {
    next(err);
  }
});

app.use(errorMiddleWare);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});