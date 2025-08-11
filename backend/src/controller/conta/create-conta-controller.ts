import { Request, Response } from "express";
import { CreateClientModel } from "../../model/cliente/create-client-model";
import { CreateUser } from "../../use-case/cliente/create-cliente-use-cases";
import { ICreateClient } from "../../interfaces/cliente/create-cliente-interfaces";
import { CreateContaModel } from "../../model/conta/create-conta-model";
import { ICreateConta } from "../../interfaces/contas/create-conta-interface";
import { CreateConta } from "../../use-case/contas/create-conta-use-case";

export class CreateContaController {
  async handle(req: Request, res: Response): Promise<void> {
    const userData = req.body;

    if (!userData?.nome) {
      res.status(400).send({
        code: 400,
        message: "Campo obrigatório 'nome' não foi fornecido.",
      });
      return;
    }
    const createUserModel = new CreateContaModel(userData);
    const payload = createUserModel.toPayload() as ICreateConta;
    const createdUser = await new CreateConta().execute(payload);
    const statusCode =
      typeof createdUser?.code === "number" ? createdUser.code : 201;

    res.status(statusCode).send(createdUser);
  }
}