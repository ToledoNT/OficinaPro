import { CreateLog } from "../logs/create-log"; 
import { ResponseTemplateInterface } from "../../interfaces/response-template-interface";
import { PrismaContaRepository } from "../../db/prisma/respositories/prisma-contas-repository";

export class GetAllContas {
  async execute(): Promise<ResponseTemplateInterface> {
    const response = await new PrismaContaRepository().getAll();
    if (!response.status) {
      await new CreateLog().execute(response);
    }
    return response;
  }
}