import { ResponseTemplateInterface } from "../../../interfaces/response-template-interface";
import { prisma } from "../../prisma-connection"; 
import { ResponseTemplateModel } from "../../../model/response-template-model";
import { ICreateClient } from "../../../interfaces/cliente/create-cliente-interfaces";
import { IUpdateClient } from "../../../interfaces/cliente/update-cliente-interface";

export class PrismaClientRepository {
  async create(data: ICreateClient): Promise<ResponseTemplateInterface> {
    try {
      const response = await prisma.cliente.create({
        data,
      });
      return new ResponseTemplateModel(
        true,
        201,
        "Cliente criado com sucesso",
        response
      );
    } catch (error) {
      console.error("Erro ao criar cliente:", error); 
      return new ResponseTemplateModel(false, 500, "Erro ao criar cliente", []);
    }
  }
  
  async delete(id: string): Promise<ResponseTemplateInterface> {
    try {
      await prisma.cliente.delete({ where: { id } });
      return new ResponseTemplateModel(
        true,
        200,
        "Cliente deletado com sucesso",
        null
      );
    } catch (error) {
      return new ResponseTemplateModel(false, 500, "Erro ao deletar cliente", []);
    }
  }

  async getAll(): Promise<ResponseTemplateInterface> {
    try {
      const response = await prisma.cliente.findMany({});
      return new ResponseTemplateModel(
        true,
        200,
        "Clientes consultados com sucesso",
        response
      );
    } catch (error) {
      return new ResponseTemplateModel(
        false,
        401,
        "Erro ao consultar clientes",
        error
      );
    }
  }

  async find(criteria: any): Promise<ResponseTemplateInterface> {
    try {
      const whereClause = typeof criteria === 'string' ? { email: criteria } : criteria;
  
      const response = await prisma.cliente.findMany({
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

  async update(
    userId: string,
    value: Partial<IUpdateClient> & { id?: string }
  ): Promise<ResponseTemplateInterface> {
    try {
      const existingUser = await prisma.cliente.findUnique({ where: { id: userId } });
  
      if (!existingUser) {
        return new ResponseTemplateModel(false, 404, "Usuário não encontrado", null);
      }
  
      // Desestrutura id fora, para garantir que ele não vai para o Prisma
      const { id, endereco, veiculos, ...rest } = value;
  
      const dataForPrisma: any = {
        ...rest,
        ...(endereco ? { endereco: { set: endereco } } : undefined),
        ...(veiculos ? { veiculos: { set: veiculos } } : undefined), // ajuste correto aqui
      };
  
      const response = await prisma.cliente.update({
        where: { id: userId },
        data: dataForPrisma,
      });
  
      return new ResponseTemplateModel(true, 200, "Cliente atualizado com sucesso", response);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      return new ResponseTemplateModel(false, 500, "Erro ao atualizar cliente", error);
    }
  }
}