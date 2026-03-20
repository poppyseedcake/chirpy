import type { MigrationConfig } from "drizzle-orm/migrator";

type APIConfig = {
  fileServerHits: number;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

process.loadEnvFile();

function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export const config = {
  api: {
    fileServerHits: 0,
  } satisfies APIConfig,
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: {
      migrationsFolder: "./src/db/migrations",
    },
  } satisfies DBConfig,
};