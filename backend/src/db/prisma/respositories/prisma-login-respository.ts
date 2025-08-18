 
import { ResponseTemplateInterface } from "../../../interfaces/response-template-interface";
import { ResponseTemplateModel } from "../../../model/response-template-model";
import { prisma } from "../../prisma-connection"; 

export class PrismaUserRepository {
    async find(criteria: any): Promise<ResponseTemplateInterface> {
    try {
      const whereClause = typeof criteria === 'string' ? { email: criteria } : criteria;
  
      const response = await prisma.user.findMany({
        where: whereClause,
      });
  
      if (!response || response.length === 0) {
        return new ResponseTemplateModel(false, 404, "Clientes não encontrados na base", []);
      }
  
      return new ResponseTemplateModel(true, 200, "Clientes encontrados com sucesso", response);
  
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return new ResponseTemplateModel(false, 500, "Erro interno ao buscar clientes", []);
    }
  }
}