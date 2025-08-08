import express, { Router } from "express";

// Controllers
import { CreateServiceController } from "../controller/service/create-service-controller";
import { GetAllServiceController } from "../controller/service/get-service-controller";
import { UpdateServiceController } from "../controller/service/update-service-controller";
import { DeleteServiceController } from "../controller/service/delete-service-controller";

const router: Router = express.Router();

const createServiceController = new CreateServiceController();
const getAllServiceController = new GetAllServiceController();
const updateServiceController = new UpdateServiceController();
const deleteServiceController = new DeleteServiceController();

router.post(
  "/service/createservice",
  createServiceController.handle.bind(createServiceController)
);

router.get(
  "/service/allservices",
  getAllServiceController.handle.bind(getAllServiceController)
);

router.put(
  "/service/updateservice/:id",
  updateServiceController.handle.bind(updateServiceController)
);

router.delete(
  "/service/deleteservice/:id", 
  deleteServiceController.handle.bind(deleteServiceController) 
);

export default router;