const Bull = require("bull");

const AppErr = require("../appError");
const SendEmail = require("./sendEmail");

const emailQueue = new Bull("emailQueue", {
  // redis: {
  //   host: "redis-10293.c9.us-east-1-2.ec2.redns.redis-cloud.com",
  //   port: 10293,
  //   password: "WpWBjmxvUPuKbI34tiqT5hNUzik1tfpL",
  // },
});

const ProcessEmailJob = async (job) => {
  try {
    const { email, subject, name, extraData } = job.data;
    await SendEmail(email, subject, name, extraData);
  } catch (error) {
    throw new AppErr(error.message, 500);
  }
};

// emailQueue.process(ProcessEmailJob);

// emailQueue.on("error", (err) => {
//   console.error("Redis connection error:", err);
// });

// emailQueue.on("ready", () => {
//   console.log("Connected to Redis successfully");
// });

module.exports = emailQueue;
