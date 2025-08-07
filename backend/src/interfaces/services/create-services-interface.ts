export interface ICreateService {
    id?: string;             // id opcional para criação
    clienteId: string;       // id do cliente obrigatório
    veiculo?: string;
    data: string | Date;     // aceita string (do JSON) ou Date
    descricao: string;
    finalizado: boolean;
    status: string;
    observacoes: string;
    prioridade?: string;
    valor?: string;
    pago?: boolean;
  }
  