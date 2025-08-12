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
    console.log(userData);  // Confirme os dados recebidos

    if (!clienteId) {
      res.status(400).send({
        status: false,
        message: 'O campo "clienteId" é obrigatório.',
      });
      return;
    }

    const createContaModel = new CreateContaModel({ ...userData });
    const payload = createContaModel.toPayload() as ICreateConta;

    // Criação da conta
    const createdAccount = await new CreateConta().execute(payload);

    // Resposta de criação da conta
    res.status(201).send({
      status: true,
      message: 'Conta criada com sucesso.',
      data: createdAccount,
    });

    // Se o serviço precisa ser atualizado, vamos atualizar, mas sem responder novamente
    if (servicoId) {
      console.log("Atualizando serviço, valor de 'pago':", pago);  // Confirme o valor de 'pago'

      const updateData: IUpdateService = {
        valor,   // O valor a ser atualizado
        id: servicoId,   // ID do serviço
        pago,   // O valor de 'pago'
      };

      // Atualiza o serviço, mas não envia resposta novamente
      await new UpdateService().execute(servicoId, updateData);
    }
  }
}