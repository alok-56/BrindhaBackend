const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const os = require("os");
const cluster = require("cluster");
const globalErrHandler = require("./Middleware/globalError");
const ConnectDatabase = require("./Config/database");
const SuperadminRouter = require("./Routes/superadmin");
const VendoradminRouter = require("./Routes/vendor");
const FileRouter = require("./Routes/FileUpload");
const MasteradminRouter = require("./Routes/master");
const ProductRouter = require("./Routes/product");
const UserRouter = require("./Routes/user");
const OrderRouter = require("./Routes/order");
const PayoutRouter = require("./Routes/payout");
const TicketRouter = require("./Routes/tickets");
const RatingRouter = require("./Routes/rating");
const publicrouter = require("./Routes/contactus");
require("dotenv").config();

ConnectDatabase();
const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// Route Middleware
app.use("/api/v1/superadmin", SuperadminRouter);
app.use("/api/v1/vendor", VendoradminRouter);
app.use("/api/v1/file", FileRouter);
app.use("/api/v1/master", MasteradminRouter);
app.use("/api/v1/product", ProductRouter);
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/order", OrderRouter);
app.use("/api/v1/payout", PayoutRouter);
app.use("/api/v1/tickets", TicketRouter);
app.use("/api/v1/rating", RatingRouter);
app.use("/api/v1/public", publicrouter);

// Not fount Route
app.use("*", (req, res, next) => {
  return res.status(200).json({
    status: false,
    code: 404,
    message: "Route Not Found",
  });
});

// Global Error Handling
app.use(globalErrHandler);

const numCPUs = os.cpus().length;
const PORT = process.env.PORT || 4000;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    cluster.fork();
  });
} else {
  const server = app.listen(PORT, () => {
    console.log(`Worker process ${process.pid} is listening on port ${PORT}`);
  });
  process.on("SIGTERM", () => {
    server.close(() => {
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    server.close(() => {
      process.exit(0);
    });
  });
}
