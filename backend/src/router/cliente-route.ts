import express, { Router } from "express";
import { CreateClientController } from "../controller/clientes/create-client-controller";
import { GetAllClientsController } from "../controller/clientes/get-client-controller";
import { DeleteClienteController } from "../controller/clientes/delete-client-controller";
import { UpdateClienteController } from "../controller/clientes/update-client-controller";
import { ClientMiddleware } from "../middleware/client-middleware";

const router: Router = express.Router();

const clientMiddleware = new ClientMiddleware();

const createClientController = new CreateClientController();
const getAllClientsController = new GetAllClientsController();
const deleteClientController = new DeleteClienteController();
const updateClientController = new UpdateClienteController();

router.post(
  "/client/createcliente",
  clientMiddleware.create.bind(clientMiddleware),
  createClientController.handle.bind(createClientController)
);

router.get(
  "/client/allclients",
  clientMiddleware.getAll.bind(clientMiddleware),
  getAllClientsController.handle.bind(getAllClientsController)
);

router.delete(
  "/client/deleteclient/:id",
  clientMiddleware.delete.bind(clientMiddleware),
  deleteClientController.handle.bind(deleteClientController)
);

router.put(
  "/client/updateclient/:id",
  clientMiddleware.update.bind(clientMiddleware),
  updateClientController.handle.bind(updateClientController)
);

export default router;