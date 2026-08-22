import { Redis } from "ioredis";
import { env } from "./env.js";

export const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  username: env.redis.username,
  password: env.redis.password,
  maxRetriesPerRequest: null,
});

export async function connectRedis() {
  await redis.ping();
  console.log("✓ Redis connected");
}
