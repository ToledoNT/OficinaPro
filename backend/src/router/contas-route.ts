import express, { Router } from "express";
import { CreateContaController } from "../controller/conta/create-conta-controller";
import { UpdateContaController } from "../controller/conta/update-conta-controller";
import { GetAllContasController } from "../controller/conta/get-conta-controller";
import { DeleteContaController } from "../controller/conta/delete-conta-controller";
import { GetServiceByIdController } from "../controller/service/get-service-by-id-controller";

const router: Router = express.Router();

const createContaController = new CreateContaController();
const getAllContasController = new GetAllContasController();
const updateContaController = new UpdateContaController();
const deleteContaController = new DeleteContaController();
const getServiceByIdController = new GetServiceByIdController();

router.post(
  "/conta/createconta",
  createContaController.handle.bind(createContaController)
);

router.get(
  "/contas/allcontas",
  getAllContasController.handle.bind(getAllContasController)
);

router.put(
  "/contas/atualizarconta/:id",
  updateContaController.handle.bind(updateContaController)
);

router.delete(
  "/contas/deletecontas/:id",
  deleteContaController.handle.bind(deleteContaController)
);

router.get(
  "/contas/getservicos",
  getServiceByIdController.handle.bind(getServiceByIdController)
);


export default router;