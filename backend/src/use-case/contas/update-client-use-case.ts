import { PrismaContaRepository } from "../../db/prisma/respositories/prisma-contas-repository";
import { PrismaClientRepository } from "../../db/prisma/respositories/prisma-user-repository";
import { IUpdateClient } from "../../interfaces/cliente/update-cliente-interface";
import { ResponseTemplateInterface } from "../../interfaces/response-template-interface";
import { CreateLog } from "../logs/create-log";

export class UpdateConta {
  async execute(id: string, updateData: IUpdateClient): Promise<ResponseTemplateInterface> {
  const responseUpdate = await new PrismaContaRepository().update(id, updateData);

    if (!responseUpdate.status) {
      await new CreateLog().execute(responseUpdate);
    }

    return responseUpdate;
  }
}