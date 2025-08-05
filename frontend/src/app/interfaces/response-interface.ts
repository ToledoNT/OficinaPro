import { Cliente } from "./clientes-interface";

export interface ApiResponseCliente {
    status: boolean;
    code: number;
    message: string;
    data?: Cliente;
  }
  
  export interface ApiResponseClientes {
    status: boolean;
    code: number;
    message: string;
    data?: Cliente[];
  }