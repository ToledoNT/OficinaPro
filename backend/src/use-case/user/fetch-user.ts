import { PrismaUserRepository } from "../../db/prisma/respositories/prisma-login-respository";
import { IResponseUser } from "../../interfaces/responses/response-cliente-interface";
import { ResponseUserModel } from "../../model/response/response-user-model";
import { CreateLog } from "../logs/create-log";

export class FetchUser {
  async execute(criteria: any): Promise<IResponseUser> {
    const response = await new PrismaUserRepository().find(criteria);
    if (!response.status) {
      await new CreateLog().execute(response);
    }
    return new ResponseUserModel(response);
  }
}