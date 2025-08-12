import { Request, Response } from "express";
import { findByServiceId } from "../../use-case/service/get-service-by-id-use-case"; // Ajuste o caminho conforme necessário
import { CreateContaModel } from "../../model/conta/create-conta-model"; // Ajuste o caminho conforme necessário
import { CreateConta } from "../../use-case/contas/create-conta-use-case"; // Ajuste o caminho conforme necessário
import { ICreateConta } from "../../interfaces/contas/create-conta-interface"; // Ajuste o caminho conforme necessário

export class CreateContaController {
  async handle(req: Request, res: Response): Promise<void> {
    const userData = req.body;
    console.log(userData);
//     const servicoId = req.body.servicoId;
// //Enviar o ClientID Direto 
//     if (!servicoId) {
//        res.status(400).send({
//         status: false,
//         message: 'O campo "servicoId" é obrigatório.',
//       });
//     }
//     const searchClient = await new findByServiceId().execute(servicoId);
//     if (!searchClient.data) {
//        res.status(404).send({
//         status: false,
//         message: 'Serviço não encontrado.',
//       });
//     }
//     const clientId = searchClient.data.clienteId;
//     const createContaModel = new CreateContaModel({
//       ...userData, 
//       clienteId: clientId, 
//     });
//     const payload = createContaModel.toPayload() as ICreateConta;
//     const createdAccount = await new CreateConta().execute(payload);

//     res.status(200).send({
//       status: true,
//       message: 'Conta criada com sucesso',
//       clienteId: clientId,  
//       data: createdAccount, 
//     });
  }
}