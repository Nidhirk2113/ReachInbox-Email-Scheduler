import IORedis from "ioredis";
import { env } from "./env.js";

export const redis = new IORedis({
  host: env.redis.host,
  port: env.redis.port,
  maxRetriesPerRequest: null,
});

export async function connectRedis() {
  await redis.ping();
  console.log("? Redis connected");
}
