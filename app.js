import express from "express";
import cookieParser from "cookie-parser";
import dataBaseConnection from "./config/dbconncetion.js";
import UserRouter from "./routers/userRouter.js";
import morgan from "morgan";
import cors from "cors";
import ErrorMiddleware from "./Middleware/Error.Middleware.js";
import ContentRouter from "./routers/ContentRouter.js";
import ADMINRouter from "./routers/ADMIN.router.js";
import ProductRouter from "./routers/Product.router.js";
import CardRouter from "./routers/Card.Router.js";
import OrderRouter from "./routers/Order.rouder.js";

const app = express();

dataBaseConnection();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);

app.use("/ping", (req, res, next) => {
  res.status(200).send("server is updated");
});

//
app.use("/api/v3/user", UserRouter);
app.use("/api/v3/Content", ContentRouter);
app.use("/api/v3/Admin", ADMINRouter);
app.use("/api/v3/Product", ProductRouter);
app.use("/api/v3/Card", CardRouter);
app.use("/api/v3/Order", OrderRouter);

app.use("*", (req, res, next) => {
  res.status(404).send("Oops ! page not found..");
});
app.use(ErrorMiddleware);
export default app;
