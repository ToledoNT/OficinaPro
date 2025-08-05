import express, { Router } from "express";
import { CreateClientController } from "../controller/clientes/create-client";

const router: Router = express.Router();

const createUserController = new CreateClientController();


router.post(
  "/client/createcliente",
//   clienteMiddleware.handle.bind(clienteMiddleware),
  createUserController.handle.bind(createUserController)
);

export default router;