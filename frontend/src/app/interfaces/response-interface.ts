import { Cliente } from "./clientes-interface";

export interface ApiResponse<T> {
  status: boolean;
  code: number;
  message: string;  
  data?: T;
}
export interface ApiResponseDeleteResponse {
  status: boolean;
  mensagem?: string;
  dados?: null | Record<string, unknown>;
}

export interface ApiResponseVoid {
  status: boolean;
  code: number;
  message: string; 
}

export type ApiResponseCliente = ApiResponse<Cliente>;
export type ApiResponseClientes = ApiResponse<Cliente[]>;

