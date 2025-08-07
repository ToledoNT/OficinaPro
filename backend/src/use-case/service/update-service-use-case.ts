import { PrismaServiceRepository } from "../../db/prisma/respositories/prisma-service-repository";
import { ResponseTemplateInterface } from "../../interfaces/response-template-interface";
import { IUpdateService } from "../../interfaces/services/update-service-interface";
import { CreateLog } from "../logs/create-log";

export class UpdateService {
  async execute(id: string, updateData: IUpdateService): Promise<ResponseTemplateInterface> {
    if (!id) throw new Error("ID do usuário é obrigatório para atualização");
    const responseUpdate = await new PrismaServiceRepository().update(id, updateData);

    if (!responseUpdate.status) {
      await new CreateLog().execute(responseUpdate);
    }

    return responseUpdate;
  }
}