import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { connectRedis } from "./config/redis.js";

async function startServer() {
  try {
    await connectDatabase();
    await connectRedis();

    app.listen(env.port, "0.0.0.0", () => {
  console.log(`API running on port ${env.port}`);
  });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
