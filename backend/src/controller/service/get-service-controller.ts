import { Request, Response } from "express";
import { GetAllClients } from "../../use-case/cliente/get-clientes-use-cases";
import { GetAllServices } from "../../use-case/service/get-services-use-cases";

export class GetAllServiceController {
  async handle(req: Request, res: Response): Promise<void> {
    const resultado = await new GetAllServices().execute();
    console.log(resultado);
    res.status(resultado.code).send(resultado);
    return;
  }
}