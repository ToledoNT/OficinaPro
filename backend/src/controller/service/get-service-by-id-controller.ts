import { Request, Response } from "express";
import { GetServicesByClientID } from "../../use-case/service/get-client-serviceby-id";

export class GetServiceByIdController {
    async handle(req: Request, res: Response): Promise<void> {
      const id = req.query.id as string; 
      if (!id) {
        res.status(400).send({ code: 400, message: "ID do cliente é obrigatório" });
        return;
      }
      const resultado = await new GetServicesByClientID().execute(id);
      res.status(resultado.code).send(resultado);
    }
  }