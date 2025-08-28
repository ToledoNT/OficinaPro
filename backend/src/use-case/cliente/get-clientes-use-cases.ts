import { CreateLog } from "../logs/create-log"; 
import { ResponseTemplateInterface } from "../../interfaces/response-template-interface";
import { PrismaClientRepository } from "../../db/prisma/respositories/prisma-user-repository";

export class GetAllClients {
  async execute(): Promise<ResponseTemplateInterface> {
    const response = await new PrismaClientRepository().getAll();
    if (!response.status) {
      await new CreateLog().execute(response);
    }
    return response;
  }
}