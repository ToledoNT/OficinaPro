import { Request, Response } from "express";
import { GetAllClients } from "../../use-case/cliente/get-clientes-use-cases";
import { GetAllContas } from "../../use-case/contas/get-contas-use-cases";

export class GetAllContasController {
  async handle(req: Request, res: Response): Promise<void> {
    const resultado = await new GetAllContas().execute()
    res.status(resultado.code).send(resultado);
    return;
  }
}