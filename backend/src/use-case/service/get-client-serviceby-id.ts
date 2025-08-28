import { CreateLog } from "../logs/create-log"; 
import { ResponseTemplateInterface } from "../../interfaces/response-template-interface";
import { PrismaServiceRepository } from "../../db/prisma/respositories/prisma-service-repository";

export class GetServicesByClientID {
  async execute(id: string): Promise<ResponseTemplateInterface> {
    const response = await new PrismaServiceRepository().findByClienteId(id);
    if (!response.status) {
      await new CreateLog().execute(response);
    }
    return response;
  }
}