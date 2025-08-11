import { Request, Response } from "express";
import { DeleteClient } from "../../use-case/cliente/delete-client-use-cases";
import { DeleteConta } from "../../use-case/contas/delete-client-use-cases";

export class DeleteContaController {
  async handle(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (id) {
      const deleteUser = await new DeleteConta().execute(id);
      if (deleteUser) {
        res.status(200).json({ mensagem: "Cliente deletado com sucesso", dados: deleteUser });
      } else {
        res.status(500).json({ erro: "Erro ao deletar usuário pelo ID", detalhes: deleteUser });
      }
    }
  }
}