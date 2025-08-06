import axios, { AxiosInstance, AxiosError } from "axios";
import { IRegisterClienteData, Cliente, IUpdateClienteData } from "@/app/interfaces/clientes-interface";
import { ApiResponseCliente, ApiResponseClientes } from "@/app/interfaces/response-interface";

const apiBaseURL = "http://localhost:4001/api";

export class ApiService {
  private api: AxiosInstance;

  constructor(baseURL: string = apiBaseURL) {
    this.api = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getClientes(): Promise<Cliente[]> {
    try {
      const response = await this.api.get<ApiResponseClientes>("/client/allclients");
      console.log("Resposta da API getClientes:", response.data);
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
      return this.handleError(error, "Erro ao registrar usuário");
    }
  }

  async updateCliente(id: string | string, data: IUpdateClienteData): Promise<ApiResponseCliente> {
    try {
      console.log("updateCliente -> id:", id, "data:", data);
      const response = await this.api.put<ApiResponseCliente>(`/client/updateclient/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error, "Erro ao atualizar usuário");
    }
  }
  

  async deleteCliente(id: string): Promise<ApiResponseCliente> {
    try {
      const response = await this.api.delete<ApiResponseCliente>(`/client/deleteclient/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, "Erro ao deletar usuário");
    }
  }
  

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