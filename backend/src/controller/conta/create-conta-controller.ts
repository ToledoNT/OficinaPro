import { Request, Response } from "express";
import { CreateContaModel } from "../../model/conta/create-conta-model";
import { CreateConta } from "../../use-case/contas/create-conta-use-case";
import { ICreateConta } from "../../interfaces/contas/create-conta-interface";

export class CreateContaController {
  async handle(req: Request, res: Response): Promise<void> {
    const userData = req.body;
    const { clienteId } = userData;
    if (!clienteId) {
      res.status(400).send({
        status: false,
        message: 'O campo "clienteId" é obrigatório.',
      });
    }
    const createContaModel = new CreateContaModel({ ...userData });
    const payload = createContaModel.toPayload() as ICreateConta;
    const createdAccount = await new CreateConta().execute(payload);
    res.status(201).send({
      status: true,
      message: 'Conta criada com sucesso.',
      data: createdAccount,
    });
  }
}