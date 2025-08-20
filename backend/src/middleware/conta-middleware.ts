import { Request, Response, NextFunction } from "express";

export class ContaServiceMiddleware {
  async handleCreateConta(req: Request, res: Response, next: NextFunction): Promise<void> {
    const data = req.body;
    const isCreatingConta = req.method === "POST" && req.originalUrl === "/api/contas";

    if (isCreatingConta) {
      if (!data?.clienteId) {
        res.status(400).json({
          code: 400,
          message: "O campo obrigatório 'clienteId' não foi fornecido.",
        });
        return;
      }

      if (!data?.valor) {
        res.status(400).json({
          code: 400,
          message: "O campo obrigatório 'valor' não foi fornecido.",
        });
        return;
      }
    }

    next();
  }

  async handleUpdateConta(req: Request, res: Response, next: NextFunction): Promise<void> {
    const isUpdatingConta = req.method === "PUT" && req.originalUrl.startsWith("/api/contas/");

    if (isUpdatingConta) {
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

  async handleDeleteConta(req: Request, res: Response, next: NextFunction): Promise<void> {
    const isDeletingConta = req.method === "DELETE" && req.originalUrl.startsWith("/api/contas/");

    if (isDeletingConta) {
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

  async handleGetServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const isGettingServices = req.method === "GET" && req.originalUrl.startsWith("/api/services");

    if (isGettingServices) {
      const id = req.query.id as string;

      if (!id) {
        res.status(400).json({
          code: 400,
          message: "ID do cliente é obrigatório.",
        });
        return;
      }
    }

    next();
  }
}