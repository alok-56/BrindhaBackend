// config/redisConfig.js
const Redis = require("ioredis");

// Create a single Redis instance that will be reused
const redisClient = new Redis({
  host: "redis-10293.c9.us-east-1-2.ec2.redns.redis-cloud.com",
  port: 10293,
  password: "WpWBjmxvUPuKbI34tiqT5hNUzik1tfpL",

  // Connection pool settings
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxReadyCheck: 5000,

  // Connection management
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,

  // Reconnection settings
  reconnectOnError: (err) => {
    const targetError = "READONLY";
    return err.message.includes(targetError);
  },

  // Connection pool limits
  family: 4,
  db: 0,
});

// Handle connection events
redisClient.on("connect", () => {
  console.log("✅ Connected to Redis successfully");
});

redisClient.on("ready", () => {
  console.log("✅ Redis is ready to receive commands");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

redisClient.on("close", () => {
  console.log("⚠️ Redis connection closed");
});

redisClient.on("reconnecting", () => {
  console.log("🔄 Reconnecting to Redis...");
});

module.exports = {
  redis: {
    host: "redis-10293.c9.us-east-1-2.ec2.redns.redis-cloud.com",
    port: 10293,
    password: "WpWBjmxvUPuKbI34tiqT5hNUzik1tfpL",
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    // Use the shared connection for Bull
    createClient: (type) => {
      switch (type) {
        case "client":
          return redisClient;
        case "subscriber":
          return redisClient.duplicate();
        case "bclient":
          return redisClient.duplicate();
        default:
          return redisClient;
      }
    },
  },
  redisClient, // Export the client for direct use if needed
};
