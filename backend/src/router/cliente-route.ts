import express, { Router } from "express";
import { CreateClientController } from "../controller/clientes/create-client-controller";
import { GetAllClientsController } from "../controller/clientes/get-clientes-controller";
import { DeleteClienteController } from "../controller/clientes/delete-client-controller";

const router: Router = express.Router();

const createUserController = new CreateClientController();
const getAllClientsController = new GetAllClientsController();
const deleteClientController = new DeleteClienteController();



router.post(
  "/client/createcliente",
//   clienteMiddleware.handle.bind(clienteMiddleware),
  createUserController.handle.bind(createUserController)
);

router.get(
  "/client/allclients", 
  // getUsersMiddleware.handle.bind(getUsersMiddleware),
  getAllClientsController.handle.bind(getAllClientsController)
);

router.delete(
  "/client/deleteclient/:id", 
  deleteClientController.handle.bind(deleteClientController)
);



export default router;