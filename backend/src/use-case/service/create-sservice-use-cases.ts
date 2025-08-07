import { PrismaServiceRepository } from "../../db/prisma/respositories/prisma-service-repository";
import { PrismaClientRepository } from "../../db/prisma/respositories/prisma-user-repository";
import { ResponseTemplateInterface } from "../../interfaces/response-template-interface";
import { ICreateService } from "../../interfaces/services/create-services-interface";
import { CreateLog } from "../logs/create-log";

export class CreateService {
  async execute(user: ICreateService): Promise<ResponseTemplateInterface> {
    const responseCreate = await new PrismaServiceRepository().create(user)
    if (!responseCreate.status) {
      await new CreateLog().execute(responseCreate);
    }
    return responseCreate;
  }
}