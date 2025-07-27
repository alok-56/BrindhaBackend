const Bull = require("bull");
const AppErr = require("../appError");
const SendEmail = require("./sendEmail");
require("dotenv").config();

const emailQueue = new Bull("emailQueue", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
});

const ProcessEmailJob = async (job) => {
  try {
    const { email, subject, name, extraData } = job.data;
    await SendEmail(email, subject, name, extraData);
  } catch (error) {
    throw new AppErr(error.message, 500);
  }
};
if (process.env.REDID_ENABLED === "true") {
  emailQueue.process(ProcessEmailJob);

  emailQueue.on("error", (err) => {
    console.error("Redis connection error:", err);
  });

  emailQueue.on("ready", () => {
    console.log("Connected to Redis successfully");
  });
}

module.exports = emailQueue;
