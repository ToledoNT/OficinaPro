import { Request, Response } from "express";
import { UpdateConta } from "../../use-case/contas/update-client-use-case";
import { UpdateService } from "../../use-case/service/update-service-use-case";
import { IUpdateConta } from "../../interfaces/contas/update-conta-interface";
import { IUpdateService } from "../../interfaces/services/update-service-interface";

export class UpdateContaController {
  async handle(req: Request, res: Response): Promise<void> {
    const id = req.params?.id;

    if (!id) {
      res.status(400).send({
        code: 400,
        message: "ID é obrigatório.",
      });
      return;
    }

    const updateData: IUpdateConta = req.body;

    const updatedConta = await new UpdateConta().execute(id, updateData);

    res.status(typeof updatedConta.code === "number" ? updatedConta.code : 200).send(updatedConta);

    const { servicoId, valor, pago } = updateData;

    if (servicoId && valor !== undefined) {
      const updateServiceData: IUpdateService = {
        id: servicoId,
        valor,
        pago,
      };

      await new UpdateService().execute(servicoId, updateServiceData);
    }
  }
}