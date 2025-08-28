import { Request, Response, NextFunction } from "express";

export class ClientMiddleware {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const data = req.body;
    const isCreatingClient = req.method === "POST" && req.originalUrl === "/api/clientes";

    if (isCreatingClient) {
      if (!data?.nome) {
        res.status(400).json({
          code: 400,
          message: "Campo obrigatório 'nome' não foi fornecido.",
        });
        return;
      }
    }

    next();
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const isGettingClients = req.method === "GET" && req.originalUrl === "/api/clientes";

    if (!isGettingClients) {
      return next();
    }

    next();
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const isDeletingClient = req.method === "DELETE" && req.originalUrl.startsWith("/api/clientes/");

    if (isDeletingClient) {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          code: 400,
          message: "Parâmetro obrigatório 'id' não fornecido.",
        });
        return;
      }
    }

    next();
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const isUpdatingClient = req.method === "PUT" && req.originalUrl.startsWith("/api/clientes/");

    if (isUpdatingClient) {
      const id = req.params?.id;
      const data = req.body;

      if (!id) {
        res.status(400).json({
          code: 400,
          message: "Parâmetro obrigatório 'id' não fornecido.",
        });
        return;
      }

      if (!data || Object.keys(data).length === 0) {
        res.status(400).json({
          code: 400,
          message: "Nenhum dado fornecido para atualização.",
        });
        return;
      }
    }

    next();
  }
}