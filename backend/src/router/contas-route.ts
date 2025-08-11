import express, { Router } from "express";

// Controllers
import { CreateContaController } from "../controller/conta/create-conta-controller";
import { UpdateContaController } from "../controller/conta/update-conta-controller";
import { GetAllContasController } from "../controller/conta/get-conta-controller";
import { DeleteContaController } from "../controller/conta/delete-conta-controller";

const router: Router = express.Router();

const createServiceController = new CreateContaController();
const getAllContaController = new GetAllContasController();
const updateContaController = new UpdateContaController();
const deleteContaController = new DeleteContaController();

router.post(
  "/contas/createconta",
  createServiceController.handle.bind(createServiceController)
);

router.get(
  "/contas/allcontas",
  getAllContaController.handle.bind(getAllContaController)
);

router.put(
  "/contas/atualizarconta/:id",
  updateContaController.handle.bind(updateContaController)
);

router.delete(
  "/contas/deletecontas/:id", 
  deleteContaController.handle.bind(deleteContaController) 
);

export default router;