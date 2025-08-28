import { Request, Response } from "express";
export class StatusController {
  async handle(req: Request, res: Response) {
    return res
      .status(200)
      .send({ status: true, code: 200, message: "Serviço rodando", data: [] });
  }
}