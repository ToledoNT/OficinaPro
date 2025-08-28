import { PrismaContaRepository } from "../../db/prisma/respositories/prisma-contas-repository";
import { ICreateConta } from "../../interfaces/contas/create-conta-interface";
import { ResponseTemplateInterface } from "../../interfaces/response-template-interface";
import { CreateLog } from "../logs/create-log";

export class CreateConta {
  async execute(conta: ICreateConta): Promise<ResponseTemplateInterface> {
    const responseCreate = await new PrismaContaRepository().create(conta)
    if (!responseCreate.status) {
      await new CreateLog().execute(responseCreate);
    }
    return responseCreate;
  }
}