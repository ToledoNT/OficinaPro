export interface ICreateConta {
  id?: string;
  dataPagamento: string;
  clienteId?: string | null; 
  descricao: string;
  categoria: string;
  tipo: 'A pagar' | 'A receber';
  valor: string;
  pago: boolean;
  observacoes: string;
  temServico: boolean;
  servicoVinculado?: string;
}
