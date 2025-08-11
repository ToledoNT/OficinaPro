export interface IUpdateConta {
  dataPagamento?: string;
  clienteId?: string;
  descricao?: string;
  categoria?: string;
  tipo?: 'A pagar' | 'A receber';
  valor?: string;
  pago?: boolean;
  observacoes?: string;
  temServico?: boolean;
  servicoVinculado?: string;
}