import { Request, Response } from "express";
import { GetAllClients } from "../../use-case/cliente/get-clientes-use-cases";

export class GetAllClientsController {
  async handle(req: Request, res: Response): Promise<void> {
    const resultado = await new GetAllClients().execute()
    res.status(resultado.code).send(resultado);
    return;
  }
}