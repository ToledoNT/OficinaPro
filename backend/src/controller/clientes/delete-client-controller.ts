import { Request, Response } from "express";
import { DeleteClient } from "../../use-case/cliente/delete-client-use-cases";

export class DeleteClienteController {
  async handle(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (id) {
      const deleteUser = await new DeleteClient().execute(id);
      if (deleteUser && deleteUser.status !== false) {
        res.status(200).json({ mensagem: "Usuário deletado com sucesso via ID", dados: deleteUser });
        return;
      }
      res.status(500).json({ erro: "Erro ao deletar usuário pelo ID", detalhes: deleteUser });
      return;
    }
  }
}