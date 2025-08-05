import { CreateLog } from "../logs/create-log"; 
import { ResponseTemplateInterface } from "../../interfaces/response-template-interface"; 
import { PrismaClientRepository } from "../../db/prisma/respositories/prisma-user-repository";

export class DeleteClient {
  async execute(id: string): Promise<ResponseTemplateInterface> {
    const responseCreate = await new PrismaClientRepository().delete(id)
    if (!responseCreate.status) {
      await new CreateLog().execute(responseCreate);
    }
    return responseCreate;
  }
}