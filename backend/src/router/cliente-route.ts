import express, { Router } from "express";
import { CreateClientController } from "../controller/clientes/create-client";
import { GetAllClientsController } from "../controller/clientes/get-clientes-controller";

const router: Router = express.Router();

const createUserController = new CreateClientController();
const getAllUsersController = new GetAllClientsController();



router.post(
  "/client/createcliente",
//   clienteMiddleware.handle.bind(clienteMiddleware),
  createUserController.handle.bind(createUserController)
);

router.get(
  "/client/allclients", 
  // getUsersMiddleware.handle.bind(getUsersMiddleware),
  getAllUsersController.handle.bind(getAllUsersController)
);
export default router;