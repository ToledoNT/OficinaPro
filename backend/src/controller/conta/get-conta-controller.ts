import { Request, Response } from "express";
import { GetAllContasWithClienteName } from "../../use-case/contas/get-contas-use-cases";

export class GetAllContasController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const response = await new GetAllContasWithClienteName().execute();
      res.status(typeof response.code === "number" ? response.code : 200).send(response);
    } catch (error) {
      console.error("Erro ao processar requisição:", error);
      res.status(500).send({
        status: false,
        code: 500,
        message: "Erro ao processar a requisição",
        data: null,
      });
    }
  }
}