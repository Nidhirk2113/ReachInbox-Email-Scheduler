import { Redis } from "ioredis";
import { env } from "./env.js";

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
});

export async function connectRedis() {
  await redis.ping();
  console.log("? Redis connected");
}
