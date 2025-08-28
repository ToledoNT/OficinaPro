import express, { Router } from "express";
import { CreateContaController } from "../controller/conta/create-conta-controller";
import { UpdateContaController } from "../controller/conta/update-conta-controller";
import { GetAllContasController } from "../controller/conta/get-conta-controller";
import { DeleteContaController } from "../controller/conta/delete-conta-controller";
import { GetServiceByIdController } from "../controller/service/get-service-by-id-controller";
import { ContaServiceMiddleware } from "../middleware/conta-middleware";

const router: Router = express.Router();

const createContaController = new CreateContaController();
const getAllContasController = new GetAllContasController();
const updateContaController = new UpdateContaController();
const deleteContaController = new DeleteContaController();
const getServiceByIdController = new GetServiceByIdController();

const contaServiceMiddleware = new ContaServiceMiddleware();

router.post(
  "/conta/createconta",
  contaServiceMiddleware.handleCreateConta.bind(contaServiceMiddleware),
  createContaController.handle.bind(createContaController)
);

router.get(
  "/contas/allcontas",
  getAllContasController.handle.bind(getAllContasController)
);

router.put(
  "/conta/updateconta/:id",
  contaServiceMiddleware.handleUpdateConta.bind(contaServiceMiddleware),
  updateContaController.handle.bind(updateContaController)
);

router.delete(
  "/conta/deleteconta/:id",
  contaServiceMiddleware.handleDeleteConta.bind(contaServiceMiddleware),
  deleteContaController.handle.bind(deleteContaController)
);

router.get(
  "/contas/getservicos",
  contaServiceMiddleware.handleGetServiceById.bind(contaServiceMiddleware),
  getServiceByIdController.handle.bind(getServiceByIdController)
);

export default router;