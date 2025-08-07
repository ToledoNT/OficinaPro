import { Cliente } from "./clientes-interface";

export interface ApiResponse<T> {
  status: boolean;
  code: number;
  message: string;
  data?: T; // data opcional, genérico
}

// Usos específicos para Clientes e listas de Clientes
export type ApiResponseCliente = ApiResponse<Cliente>;
export type ApiResponseClientes = ApiResponse<Cliente[]>;