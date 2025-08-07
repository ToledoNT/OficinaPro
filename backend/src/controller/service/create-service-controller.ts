import { Request, Response } from "express";
import { CreateServiceModel } from "../../model/services/create-service-model";
import { ICreateService } from "../../interfaces/services/create-services-interface";
import { CreateService } from "../../use-case/service/create-sservice-use-cases";

export class CreateServiceController {
  async handle(req: Request, res: Response): Promise<void> {
    const serviceData = req.body;
    console.log(serviceData);

    if (!serviceData?.clienteId) {
      res.status(400).send({
        code: 400,
        message: "Campo obrigatório 'clienteId' não foi fornecido.",
      });
      return;
    }

    const createServiceModel = new CreateServiceModel(serviceData);
    const payload = createServiceModel.toPayload() as ICreateService;

    const createdService = await new CreateService().execute(payload);

    const statusCode =
      typeof createdService?.code === "number" ? createdService.code : 201;

    res.status(statusCode).send(createdService);
  }
}