import { CreateLog } from "../logs/create-log";
import { PrismaContaRepository } from "../../db/prisma/respositories/prisma-contas-repository";
import { ResponseTemplateInterface } from "../../interfaces/response-template-interface";

export class GetAllContasWithClienteName {
  async execute(): Promise<ResponseTemplateInterface> {
    try {
      const response = await new PrismaContaRepository().fetchContasWithCliente();

      if (!response.status) {
        await new CreateLog().execute(response);
      }

      return response;
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Erro ao buscar contas",
        data: null,
      };
    }
  }
}