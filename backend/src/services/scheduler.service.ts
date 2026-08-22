import { redis } from "../config/redis.js";

const SLOT_KEY = "email:scheduler:next-slot";

export async function reserveEmailSlots(
  startTime: Date,
  count: number,
  minDelay: number,
  hourlyLimit: number
): Promise<Date[]> {
  if (count <= 0) {
    return [];
  }

  if (minDelay <= 0) {
    throw new Error("Minimum email delay must be greater than 0");
  }

  if (hourlyLimit <= 0) {
    throw new Error("Hourly email limit must be greater than 0");
  }

  const now = Date.now();

  const script = `
    local slotKey = KEYS[1]

    local requestedStart = tonumber(ARGV[1])
    local count = tonumber(ARGV[2])
    local minDelay = tonumber(ARGV[3])
    local hourlyLimit = tonumber(ARGV[4])
    local now = tonumber(ARGV[5])

    local nextSlot =
      tonumber(redis.call("GET", slotKey) or "0")

    -- Never schedule before requested start.
    if nextSlot < requestedStart then
      nextSlot = requestedStart
    end

    -- Never schedule in the past.
    if nextSlot < now then
      nextSlot = now
    end

    local results = {}

    for i = 1, count do

      local hourStart =
        math.floor(nextSlot / 3600000) * 3600000

      local hourEnd =
        hourStart + 3600000

      local counterKey =
        "email:scheduler:hour:" .. tostring(hourStart)

      local used =
        tonumber(redis.call("GET", counterKey) or "0")

      -- Move to the next hour when the limit is reached.
      if used >= hourlyLimit then

        nextSlot = hourEnd

        hourStart =
          math.floor(nextSlot / 3600000) * 3600000

        hourEnd =
          hourStart + 3600000

        counterKey =
          "email:scheduler:hour:" .. tostring(hourStart)
      end

      -- Reserve this delivery slot.
      table.insert(results, nextSlot)

      -- Atomically increment the hourly counter.
      redis.call("INCR", counterKey)

      -- Keep the counter for 48 hours.
      redis.call(
        "EXPIRE",
        counterKey,
        172800
      )

      -- Apply minimum spacing between emails.
      nextSlot = nextSlot + minDelay

      -- Move to the next hour if necessary.
      if nextSlot >= hourEnd then
        nextSlot = hourEnd
      end
    end

    -- Persist the next available slot.
    redis.call(
      "SET",
      slotKey,
      tostring(nextSlot)
    )

    return results
  `;

  const result = await redis.eval(
    script,
    1,
    SLOT_KEY,
    startTime.getTime().toString(),
    count.toString(),
    minDelay.toString(),
    hourlyLimit.toString(),
    now.toString()
  );

  return (result as number[]).map(
    (timestamp) => new Date(timestamp)
  );
}