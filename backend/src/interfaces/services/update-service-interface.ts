export interface IUpdateService {
    id: string;               // obrigatório para identificar qual serviço atualizar
    clienteId?: string;
    veiculo?: string;
    data?: string | Date;
    descricao?: string;
    finalizado?: boolean;
    status?: string;
    observacoes?: string;
    prioridade?: string;
    valor?: string;
    pago?: boolean;
  }
  