import { Request, Response } from "express";
import { UpdateService } from "../../use-case/service/update-service-use-case";
import { IUpdateService } from "../../interfaces/services/update-service-interface";

export class UpdateServiceController {
  async handle(req: Request, res: Response): Promise<void> {
    const id = req.params?.id;

    if (!id) {
      res.status(400).send({
        code: 400,
        message: "ID é obrigatório.",
      });
      return;
    }

    const updateData: IUpdateService = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      res.status(400).send({
        code: 400,
        message: "Nenhum dado de atualização fornecido.",
      });
      return;
    }

    const updated = await new UpdateService().execute(id, updateData);

    res
      .status(typeof updated.code === "number" ? updated.code : 200)
      .send(updated);
  }
}