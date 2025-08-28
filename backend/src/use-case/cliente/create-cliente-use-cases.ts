import { PrismaClientRepository } from "../../db/prisma/respositories/prisma-user-repository";
import { ICreateClient } from "../../interfaces/cliente/create-cliente-interfaces";
import { ResponseTemplateInterface } from "../../interfaces/response-template-interface";
import { CreateLog } from "../logs/create-log";

export class CreateUser {
  async execute(user: ICreateClient): Promise<ResponseTemplateInterface> {
    const responseCreate = await new PrismaClientRepository().create(user)
    if (!responseCreate.status) {
      await new CreateLog().execute(responseCreate);
    }
    return responseCreate;
  }
}