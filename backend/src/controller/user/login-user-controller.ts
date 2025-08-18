import { Request, Response } from "express";
import { FetchUser } from "../../use-case/user/fetch-user";

export class LoginUserController {
  async handle(req: Request, res: Response): Promise<void> {
    const { user, password } = req.body; 
    if (!user || !password) {
      res.status(400).json({ message: "Usuário e senha são obrigatórios" });
      return;
    }
    const fetchUser = new FetchUser();
    const response = await fetchUser.execute(user); 
    if (!response.status || !response.data || response.data.length === 0) {
      res.status(401).json({ message: "Usuário não encontrado" });
      return;
    }
    const foundUser = response.data[0];
    if (foundUser.password !== password) {
      res.status(401).json({ message: "Senha incorreta" });
      return;
    }
    res.status(200).json({
      status: true, 
      message: "Login realizado com sucesso",
      user: {
        id: foundUser.id,
        user: foundUser.user,
      },
    });
    }
  }