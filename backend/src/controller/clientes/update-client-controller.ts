import { Request, Response } from "express";
import { UpdateClient } from "../../use-case/cliente/update-client-use-case";
import { IUpdateClient } from "../../interfaces/cliente/update-cliente-interface";

export class UpdateClienteController {
  async handle(req: Request, res: Response): Promise<void> {
    const id = req.params?.id;
    if (!id) {
      res.status(400).send({
        code: 400,
        message: "ID é obrigatório.",
      });
      return;
    }
    const updateData: IUpdateClient = req.body;
    if (!updateData || Object.keys(updateData).length === 0) {
      res.status(400).send({
        code: 400,
        message: "Nenhum dado de atualização fornecido.",
      });
      return;
    }
    const updated = await new UpdateClient().execute(id, updateData);
    res.status(typeof updated.code === "number" ? updated.code : 200).send(updated);
  }
}