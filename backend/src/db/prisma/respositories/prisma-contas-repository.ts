import { ResponseTemplateInterface } from "../../../interfaces/response-template-interface";
import { prisma } from "../../prisma-connection"; 
import { ResponseTemplateModel } from "../../../model/response-template-model";
import { ICreateConta } from "../../../interfaces/contas/create-conta-interface";
import { IUpdateConta } from "../../../interfaces/contas/update-conta-interface";
import { IFetchConta } from "../../../interfaces/contas/fetch-conta-interfaces";

export class PrismaContaRepository {
  async create(data: ICreateConta): Promise<ResponseTemplateInterface> {
    try {
      const payload: any = { ...data };

      if (payload.clienteId) {
        payload.cliente = { connect: { id: payload.clienteId } };
        delete payload.clienteId;
      }

      if (!payload.temServico || !payload.servicoId) {
        delete payload.servicoId;
      }

      const response = await prisma.conta.create({ data: payload });

      return new ResponseTemplateModel(true, 201, "Conta criada com sucesso", response);
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      return new ResponseTemplateModel(false, 500, "Erro ao criar conta", []);
    }
  }

  async update(id: string, data: Partial<IUpdateConta>): Promise<ResponseTemplateInterface> {
    try {
      const payload: any = { ...data };

      if (payload.clienteId) {
        payload.cliente = { connect: { id: payload.clienteId } };
        delete payload.clienteId;
      }

      const response = await prisma.conta.update({
        where: { id },
        data: payload,
      });

      return new ResponseTemplateModel(true, 200, "Conta atualizada com sucesso", response);
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
      return new ResponseTemplateModel(false, 500, "Erro ao atualizar conta", []);
    }
  }

  async delete(id: string): Promise<ResponseTemplateInterface> {
    try {
      await prisma.conta.delete({ where: { id } });
      return new ResponseTemplateModel(true, 200, "Conta deletada com sucesso", null);
    } catch (error: any) {
      console.error("Erro ao deletar conta:", error);
      if (error.code === "P2025") {
        return new ResponseTemplateModel(false, 404, "Conta não encontrada para exclusão", []);
      }
      return new ResponseTemplateModel(false, 500, "Erro ao deletar conta", []);
    }
  }

  async findById(id: string): Promise<ResponseTemplateInterface> {
    try {
      const response = await prisma.conta.findUnique({ where: { id } });
      if (!response) {
        return new ResponseTemplateModel(false, 404, "Conta não encontrada", null);
      }
      return new ResponseTemplateModel(true, 200, "Conta encontrada", response);
    } catch (error) {
      console.error("Erro ao buscar conta:", error);
      return new ResponseTemplateModel(false, 500, "Erro ao buscar conta", []);
    }
  }

  async findAll(): Promise<ResponseTemplateInterface> {
    try {
      const response = await prisma.conta.findMany();
      return new ResponseTemplateModel(true, 200, "Contas listadas com sucesso", response);
    } catch (error) {
      console.error("Erro ao listar contas:", error);
      return new ResponseTemplateModel(false, 500, "Erro ao listar contas", []);
    }
  }
  async fetchContasWithCliente(): Promise<ResponseTemplateInterface> {
    try {
      const contas = await prisma.conta.findMany({ include: { cliente: true } });

      const contasComNomes: IFetchConta[] = contas.map(conta => ({
        id: conta.id,
        dataPagamento: conta.dataPagamento,
        clienteId: conta.clienteId,
        clienteNome: conta.cliente?.nome || "",  
        descricao: conta.descricao,
        categoria: conta.categoria,
        tipo: conta.tipo as "A pagar" | "A receber",
        valor: conta.valor,
        pago: conta.pago,
        observacoes: conta.observacoes,
        temServico: conta.temServico,
        servicoVinculado: conta.servicoVinculado ?? "", 
        servicoId: conta.servicoId ?? "",              
      }));

      return new ResponseTemplateModel(true, 200, "Contas consultadas com sucesso", contasComNomes);
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
      return new ResponseTemplateModel(false, 500, "Erro ao buscar contas", []);
    }
  }
}