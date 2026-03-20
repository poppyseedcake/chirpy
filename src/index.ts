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

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
const PORT = 8080;

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

app.use(errorMiddleWare);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});