import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 5000),

  databaseUrl: requireEnv("DATABASE_URL"),

  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
  },

  workerConcurrency: Number(
    process.env.WORKER_CONCURRENCY ?? 10
  ),

  minEmailDelayMs: Number(
    process.env.MIN_EMAIL_DELAY_MS ?? 2000
  ),

  maxEmailsPerHour: Number(
    process.env.MAX_EMAILS_PER_HOUR ?? 200
  ),

  frontendUrl:
    process.env.FRONTEND_URL ?? "http://localhost:5173",

  googleClientId: requireEnv("GOOGLE_CLIENT_ID"),

  jwtSecret: requireEnv("JWT_SECRET"),
};