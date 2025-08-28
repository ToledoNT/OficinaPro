import { Request, Response } from "express";
import { CreateContaModel } from "../../model/conta/create-conta-model";
import { CreateConta } from "../../use-case/contas/create-conta-use-case";
import { ICreateConta } from "../../interfaces/contas/create-conta-interface";
import { UpdateService } from "../../use-case/service/update-service-use-case";
import { IUpdateService } from "../../interfaces/services/update-service-interface";

export class CreateContaController {
  async handle(req: Request, res: Response): Promise<void> {
    const userData = req.body;
    const { clienteId, servicoId, valor, pago } = userData;

    if (!clienteId) {
      res.status(400).send({
        status: false,
        message: 'O campo "clienteId" é obrigatório.',
      });
      return;
    }
    const createContaModel = new CreateContaModel({ ...userData });
    const payload = createContaModel.toPayload() as ICreateConta;
    const createdAccount = await new CreateConta().execute(payload);
    res.status(201).send({
      status: true,
      message: 'Conta criada com sucesso.',
      data: createdAccount,
    });
    if (servicoId) {
    const updateData: IUpdateService = {
        valor,   
        id: servicoId,   
        pago, 
      };

      await new UpdateService().execute(servicoId, updateData);
    }
  }
}