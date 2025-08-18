import { CreateLog } from "../logs/create-log"; 
import { ResponseTemplateInterface } from "../../interfaces/response-template-interface"; 
import { PrismaContaRepository } from "../../db/prisma/respositories/prisma-contas-repository";

export class DeleteConta {
  async execute(id: string): Promise<ResponseTemplateInterface> {
    const responseCreate = await new PrismaContaRepository().deleteConta(id)
    if (!responseCreate.status) {
      await new CreateLog().execute(responseCreate);
    }
    return responseCreate;
  }
}