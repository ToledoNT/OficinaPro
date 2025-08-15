export interface IFetchConta {
    id: string;
    dataPagamento: string;
    clienteId: string;
    clienteNome: string;
    descricao: string;
    categoria: string;
    tipo: "A pagar" | "A receber";
    valor: string;
    pago: boolean;
    observacoes: string;
    temServico: boolean;
    servicoVinculado?: string | null;  
    servicoId?: string | null;         
  }
  