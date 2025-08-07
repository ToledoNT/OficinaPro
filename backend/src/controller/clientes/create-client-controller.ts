import { Request, Response } from "express";
import { CreateClientModel } from "../../model/cliente/create-client-model";
import { CreateUser } from "../../use-case/cliente/create-cliente-use-cases";
import { ICreateClient } from "../../interfaces/cliente/create-cliente-interfaces";

export class CreateClientController {
  async handle(req: Request, res: Response): Promise<void> {
    const userData = req.body;

    if (!userData?.nome) {
      res.status(400).send({
        code: 400,
        message: "Campo obrigatório 'nome' não foi fornecido.",
      });
      return;
    }
    const createUserModel = new CreateClientModel(userData);
    const payload = createUserModel.toPayload() as ICreateClient;
    const createdUser = await new CreateUser().execute(payload);
    const statusCode =
      typeof createdUser?.code === "number" ? createdUser.code : 201;

    res.status(statusCode).send(createdUser);
  }
}