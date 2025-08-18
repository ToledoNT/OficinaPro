import { Request, Response } from "express";
import { FetchUser } from "../../use-case/user/fetch-user";

export class LoginUserController {
  async handle(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email e senha são obrigatórios" });
      return;
    }

    const fetchUser = new FetchUser();
    const response = await fetchUser.execute(email);

    if (!response.status || !response.data || response.data.length === 0) {
      res.status(401).json({ message: "Usuário não encontrado" });
      return;
    }

    const user = response.data[0];

    if (user.password !== password) {
      res.status(401).json({ message: "Senha incorreta" });
      return;
    }

    res.status(200).json({
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        email: user.user, 
      },
    });
  }
}