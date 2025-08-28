import express, { Application } from "express";
import cors from "cors";

import StatusRouter from "./router/status-router";
import ClienteRouter from "./router/cliente-route";
import ServiceRouter from "./router/service-router";
import ContaRouter from "./router/contas-route";
import UserRouter from "./router/user-route";

const server: Application = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://192.168.18.129:3000";

server.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/api", StatusRouter);
server.use("/api", ClienteRouter);
server.use("/api", ServiceRouter);
server.use("/api", ContaRouter);
server.use("/api", UserRouter);

export { server };