 
import { ResponseTemplateInterface } from "../../../interfaces/response-template-interface";
import { ResponseTemplateModel } from "../../../model/response-template-model";
import { prisma } from "../../prisma-connection"; 

export class PrismaUserRepository {
    async find(username: string): Promise<ResponseTemplateInterface> {
      try {
        const response = await prisma.user.findMany({
          where: { user: username },
        });
  
        if (!response || response.length === 0) {
          return new ResponseTemplateModel(false, 404, "Usuário não encontrado", []);
        }
  
        return new ResponseTemplateModel(true, 200, "Usuário encontrado com sucesso", response);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return new ResponseTemplateModel(false, 500, "Erro interno ao buscar usuário", []);
      }
    }
  }  