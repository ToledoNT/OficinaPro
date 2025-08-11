import { Request, Response } from "express";
import { UpdateClient } from "../../use-case/cliente/update-client-use-case";
import { IUpdateConta } from "../../interfaces/contas/update-conta-interface";
import { UpdateConta } from "../../use-case/contas/update-client-use-case";

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
    const updated = await new UpdateConta().execute(id, updateData);
    res.status(typeof updated.code === "number" ? updated.code : 200).send(updated);
  }
}