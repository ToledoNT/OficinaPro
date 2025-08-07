import express, { Router } from "express";

// Controllers
import { CreateServiceController } from "../controller/service/create-service-controller";
import { GetAllServiceController } from "../controller/service/get-service-controller";
import { UpdateServiceController } from "../controller/service/update-service-controller";

// Instanciando o router
const router: Router = express.Router();

// Instanciando os controllers
const createServiceController = new CreateServiceController();
const getAllServiceController = new GetAllServiceController();
const updateServiceController = new UpdateServiceController();

// Rotas de serviços
router.post(
  "/service/createservice",
  // clienteMiddleware.handle.bind(clienteMiddleware), // Ative se necessário
  createServiceController.handle.bind(createServiceController)
);

router.get(
  "/service/allservices",
  // clienteMiddleware.handle.bind(clienteMiddleware), // Ative se necessário
  getAllServiceController.handle.bind(getAllServiceController)
);

router.put(
  "/service/updateservice/:id",
  updateServiceController.handle.bind(updateServiceController)
);

export default router;