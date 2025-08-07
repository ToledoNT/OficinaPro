import { Request, Response } from "express";
import { ICreateService } from "../../interfaces/services/create-services-interface";
import { CreateService } from "../../use-case/service/create-sservice-use-cases";
import { UpdateServiceModel } from "../../model/services/update-service-model";

export class CreateServiceController {
  async handle(req: Request, res: Response): Promise<void> {
    const serviceData = req.body;
    if (!serviceData?.clienteId) {
      res.status(400).send({
        code: 400,
        message: "Campo obrigatório 'clienteId' não foi fornecido.",
      });
      return;
    }
    const createServiceModel = new UpdateServiceModel(serviceData);
    const payload = createServiceModel.toPayload() as ICreateService;
    const createdService = await new CreateService().execute(payload);
    const statusCode =
      typeof createdService?.code === "number" ? createdService.code : 201;

    res.status(statusCode).send(createdService);
  }
}