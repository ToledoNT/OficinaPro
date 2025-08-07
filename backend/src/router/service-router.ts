import express, { Router } from "express";
import { CreateServiceController } from "../controller/service/create-service-controller";
import { GetAllClientsController } from "../controller/clientes/get-client-controller";
import { GetAllServiceController } from "../controller/service/get-service-controller";

const router: Router = express.Router();

const createServiceController = new CreateServiceController();
const getAllServiceController = new GetAllServiceController();
 
router.post(
  "/service/createservice",
//   clienteMiddleware.handle.bind(clienteMiddleware),
  createServiceController.handle.bind(createServiceController)
);

router.get(
  "/service/allservices",
//   clienteMiddleware.handle.bind(clienteMiddleware),
getAllServiceController.handle.bind(getAllServiceController)
);

export default router;