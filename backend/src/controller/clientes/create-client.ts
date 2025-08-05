import { Request, Response } from "express";
import { CreateClientModel } from "../../model/cliente/create-client-model";
import { CreateUser } from "../../use-case/cliente/create-cliente-use-cases";

export class CreateClientController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
        if (!userData?.nome) {
        res.status(400).send({
          code: 400,
          message: "Campo obrigatório nome não foi fornecidos.",
        });
        return;
      }

      const createUserModel = new CreateClientModel(userData);
      const createdUser = await new CreateUser().execute(createUserModel);

      res.status(createdUser.code).send(createdUser);
    } catch (error: any) {
      console.error("Erro ao criar cliente:", error);

      res.status(500).send({
        code: 500,
        message: "Erro interno ao criar cliente.",
        error: error.message || error,
      });
    }
  }
}