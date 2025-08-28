import { CreateLog } from "../logs/create-log"; 
import { ResponseTemplateInterface } from "../../interfaces/response-template-interface";
import { PrismaClientRepository } from "../../db/prisma/respositories/prisma-user-repository";
import { PrismaServiceRepository } from "../../db/prisma/respositories/prisma-service-repository";

export class GetAllServices {
  async execute(): Promise<ResponseTemplateInterface> {
    const response = await new PrismaServiceRepository().getAll();
    if (!response.status) {
      await new CreateLog().execute(response);
    }
    return response;
  }
}