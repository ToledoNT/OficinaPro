import { Request, Response, NextFunction } from "express";

export class ServiceMiddleware {
  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const method = req.method;
    const url = req.originalUrl;
    const data = req.body;

    // Middleware para criar serviço
    if (method === "POST" && url === "/api/services") {
      if (!data?.clienteId) {
        res.status(400).json({
          code: 400,
          message: "Campo obrigatório 'clienteId' não foi fornecido.",
        });
        return;
      }
    }

    // Middleware para atualizar serviço
    if (method === "PUT" && url.startsWith("/api/services/")) {
      const id = req.params?.id;

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

    // Middleware para deletar serviço
    if (method === "DELETE" && url.startsWith("/api/services/")) {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          code: 400,
          message: "Parâmetro obrigatório 'id' não fornecido.",
        });
        return;
      }
    }

    // Middleware para pegar todos os serviços
    if (method === "GET" && url === "/api/services") {
      // Nenhuma validação obrigatória por enquanto
    }

    next();
  }
}