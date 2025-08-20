import express, { Router } from "express";
import { CreateServiceController } from "../controller/service/create-service-controller";
import { GetAllServiceController } from "../controller/service/get-service-controller";
import { UpdateServiceController } from "../controller/service/update-service-controller";
import { DeleteServiceController } from "../controller/service/delete-service-controller";

import { ServiceMiddleware } from "../middleware/service-middleware";

const router: Router = express.Router();

const createServiceController = new CreateServiceController();
const getAllServiceController = new GetAllServiceController();
const updateServiceController = new UpdateServiceController();
const deleteServiceController = new DeleteServiceController();
const serviceMiddleware = new ServiceMiddleware(); 

router.post(
  "/service/createservice",
  serviceMiddleware.handle.bind(serviceMiddleware),
  createServiceController.handle.bind(createServiceController)
);

router.get(
  "/service/allservices",
  serviceMiddleware.handle.bind(serviceMiddleware),
  getAllServiceController.handle.bind(getAllServiceController)
);

router.put(
  "/service/updateservice/:id",
  serviceMiddleware.handle.bind(serviceMiddleware),
  updateServiceController.handle.bind(updateServiceController)
);

router.delete(
  "/service/deleteservice/:id",
  serviceMiddleware.handle.bind(serviceMiddleware),
  deleteServiceController.handle.bind(deleteServiceController)
);

export default router;