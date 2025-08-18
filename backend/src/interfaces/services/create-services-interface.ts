export interface ICreateService {
    id?: string;            
    clienteId: string;       
    veiculo?: string;
    descricao: string;
    finalizado: boolean;
    status: string;
    observacoes: string;
    prioridade?: string;
    valor?: string;
    pago?: boolean;
  }