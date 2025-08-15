import axios, { AxiosInstance, AxiosError } from "axios";
import {
  IRegisterClienteData,
  Cliente,
  IUpdateClienteData,
} from "@/app/interfaces/clientes-interface";
import { ApiResponseCliente, ApiResponseClientes, ApiResponseDeleteResponse } from "@/app/interfaces/response-interface";
import { IRegisterServiceData, IUpdateServiceData, Servico } from "@/app/interfaces/service-interface";
import { IRegisterContaData, Conta } from "@/app/interfaces/contas-interface";

const apiBaseURL = "http://localhost:4001/api";

export class ApiService {
  private api: AxiosInstance;

  constructor(baseURL: string = apiBaseURL) {
    this.api = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Clientes
  async getClientes(): Promise<Cliente[]> {
    try {
      const response = await this.api.get<ApiResponseClientes>("/client/allclients");
      if (response.data.status) {
        return response.data.data || [];
      } else {
        console.error("Erro na API ao buscar clientes:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return [];
    }
  }

  async registerCliente(data: IRegisterClienteData): Promise<ApiResponseCliente> {
    try {
      const response = await this.api.post<ApiResponseCliente>("/client/createcliente", data);
      return response.data;
    } catch (error) {
      return this.handleError(error, "Erro ao registrar cliente");
    }
  }

  async updateCliente(id: string, data: IUpdateClienteData): Promise<ApiResponseCliente> {
    try {
      const response = await this.api.put<ApiResponseCliente>(`/client/updateclient/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error, "Erro ao atualizar cliente");
    }
  }

  async deleteCliente(id: string): Promise<ApiResponseDeleteResponse> {
    try {
      const response = await this.api.delete<ApiResponseDeleteResponse>(`/client/deleteclient/${id}`);
      console.log("Resposta da API:", response);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      return this.handleError(error, "Erro ao deletar cliente");
    }
  }

  // Serviços
  async getServicos(): Promise<Servico[]> {
    try {
      const response = await this.api.get<{
        status: boolean;
        data: IRegisterServiceData[];
        message?: string;
      }>("/service/allservices");

      if (response.data.status) {
        const servicosComId: Servico[] = response.data.data.map((item, index) => ({
          id: index.toString(),
          ...item,
          data: item.data ?? "",
        }));
        return servicosComId;
      } else {
        console.error("Erro na API ao buscar serviços:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      return [];
    }
  }

  async getServicosPorCliente(clienteId: string): Promise<Servico[]> {
    try {
      const response = await this.api.get<{ status: boolean; data: Servico[]; message?: string }>(
        `/contas/getservicos?id=${encodeURIComponent(clienteId)}`
      );
  
      if (response.data.status) {
        return response.data.data || [];
      }
  
      console.error("Erro na API ao buscar serviços:", response.data.message);
      return [];
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      return [];
    }
  }
  
async updateService(
    dados: IUpdateServiceData
  ): Promise<{ status: boolean; message?: string }> {
    try {
      if (!dados.id) {
        throw new Error("ID do serviço é obrigatório para atualização.");
      }
      const { id, ...dataToUpdate } = dados;

      const response = await this.api.put<{
        status: boolean;
        message?: string;
        data?: Servico;
      }>(`/service/updateservice/${id}`, dataToUpdate);

      const { status, message } = response.data;

      if (status) {
        return {
          status: true,
          message: message || "Serviço atualizado com sucesso",
        };
      } else {
        console.error("Erro na API ao atualizar serviço:", message);
        return {
          status: false,
          message: message || "Erro desconhecido ao atualizar serviço",
        };
      }
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      return {
        status: false,
        message: "Erro na requisição para atualizar serviço",
      };
    }
  }

  async registerService(data: IRegisterServiceData): Promise<ApiResponseCliente> {
    try {
      const response = await this.api.post<ApiResponseCliente>("/service/createservice", data);
      return response.data;
    } catch (error) {
      return this.handleError(error, "Erro ao registrar serviço");
    }
  }

  async deleteService(id: string): Promise<ApiResponseCliente> {
    try {
      const response = await this.api.delete<ApiResponseCliente>(`/service/deleteservice/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, "Erro ao deletar cliente");
    }
  }

  // Contas
  async getContas(): Promise<Conta[]> {
    try {
      const response = await this.api.get<{ status: boolean; data: Conta[]; message?: string }>("/contas/allcontas");
      console.log(response);
      if (response.data.status) {
        return response.data.data || [];
      } else {
        console.error("Erro na API ao buscar contas:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
      return [];
    }
  }

  async registerConta(data: IRegisterContaData): Promise<ApiResponseCliente> {
    try {
      const response = await this.api.post<ApiResponseCliente>("/conta/createconta", data);
      console.log("chegou")
      return response.data;
    } catch (error) {
      return this.handleError(error, "Erro ao registrar conta");
    }
  }

  async updateConta(id: number, data: IRegisterContaData): Promise<ApiResponseCliente> {
    try {
      const response = await this.api.put<ApiResponseCliente>(`/conta/updateconta/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error, "Erro ao atualizar conta");
    }
  }

  async deleteConta(id: number): Promise<ApiResponseCliente> {
    try {
      const response = await this.api.delete<ApiResponseCliente>(`/conta/deleteconta/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, "Erro ao deletar conta");
    }
  }

  // Tratamento de erro genérico
  private handleError(error: unknown, defaultMessage: string): ApiResponseCliente {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        status: false,
        code: axiosError.response?.status || 500,
        message: axiosError.response?.data?.message || `${defaultMessage}: ${axiosError.message}`,
      };
    }

    return {
      status: false,
      code: 500,
      message: defaultMessage,
    };
  }
}
