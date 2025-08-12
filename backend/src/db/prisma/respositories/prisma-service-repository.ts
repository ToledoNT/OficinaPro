import { ResponseTemplateInterface } from "../../../interfaces/response-template-interface";
import { prisma } from "../../prisma-connection"; 
import { ResponseTemplateModel } from "../../../model/response-template-model";
import { ICreateService } from "../../../interfaces/services/create-services-interface";
import { IUpdateService } from "../../../interfaces/services/update-service-interface";

export class PrismaServiceRepository {
  async create(data: ICreateService): Promise<ResponseTemplateInterface> {
    try {
      const response = await prisma.service.create({
        data,
      });
      return new ResponseTemplateModel(
        true,
        201,
        "Serviço criado com sucesso",
        response
      );
    } catch (error) {
      console.error("Erro ao criar serviço:", error); 
      return new ResponseTemplateModel(false, 500, "Erro ao criar serviço", []);
    }
  }
  
  async update(id: string, data: Partial<IUpdateService>): Promise<ResponseTemplateInterface> {
    try {
      const payload: any = { ...data };
  
      if (payload.clienteId) {
        payload.cliente = { connect: { id: payload.clienteId } };
        delete payload.clienteId; // Remove clienteId porque não existe no modelo Prisma
      }
  
      if ('data' in payload) {
        delete payload.data;
      }
  
      const response = await prisma.service.update({
        where: { id },
        data: payload,
      });
  
      return new ResponseTemplateModel(true, 200, "Serviço atualizado com sucesso", response);
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      return new ResponseTemplateModel(false, 500, "Erro ao atualizar serviço", []);
    }
  }
  
  async delete(id: string): Promise<ResponseTemplateInterface> {
    try {
   const response =  await prisma.service.delete({
        where: { id },
      });
      return new ResponseTemplateModel(
        true,
        200,
        "Serviço deletado com sucesso",
        null
      );
    } catch (error: any) {
      console.error("Erro ao deletar serviço:", error);
  
      if (error.code === "P2025") {
        // Registro não encontrado
        return new ResponseTemplateModel(false, 404, "Serviço não encontrado para exclusão", []);
      }
  
      return new ResponseTemplateModel(false, 500, "Erro ao deletar serviço", []);
    }
  }
  
  
  async getAll(): Promise<ResponseTemplateInterface> {
    try {
      const response = await prisma.service.findMany({});
      return new ResponseTemplateModel(
        true,
        200,
        "Services consultados com sucesso",
        response
      );
    } catch (error) {
      return new ResponseTemplateModel(
        false,
        401,
        "Erro ao consultar Services",
        error
      );
    }
  }

  async findByClienteId(clienteId: string): Promise<ResponseTemplateInterface> {
    try {
      const response = await prisma.service.findMany({
        where: { clienteId: clienteId }, 
      });
  
      if (!response || response.length === 0) {
        return new ResponseTemplateModel(false, 404, "Serviços não encontrados", []);
      }
  
      return new ResponseTemplateModel(true, 200, "Serviços encontrados", response);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      return new ResponseTemplateModel(false, 500, "Erro ao buscar serviços", []);
    }
  }

  async findByServiceId(serviceId: string): Promise<ResponseTemplateInterface> {
    try {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
  
      if (!service) {
        return new ResponseTemplateModel(false, 404, "Serviço não encontrado", null);
      }
  
      return new ResponseTemplateModel(true, 200, "Serviço encontrado", service);
    } catch (error) {
      console.error("Erro ao buscar serviço:", error);
      return new ResponseTemplateModel(false, 500, "Erro ao buscar serviço", null);
    }
  }
  
  
  async findAll(): Promise<ResponseTemplateInterface> {
    try {
      const response = await prisma.service.findMany();
      return new ResponseTemplateModel(true, 200, "Serviços listados com sucesso", response);
    } catch (error) {
      console.error("Erro ao listar serviços:", error);
      return new ResponseTemplateModel(false, 500, "Erro ao listar serviços", []);
    }
  }
}