export interface Servico {
  id?: string; // <-- aqui ajustado para string
  cliente: string;
  clienteId?: string;
  veiculo?: string;
  data: string;
  descricao: string;
  finalizado: boolean;
  status: string;
  observacoes: string;
  prioridade?: string;
  valor?: string;
  pago?: boolean;
}

export interface IRegisterServiceData {
  cliente: string;
  clienteId?: string;
  veiculo?: string;
  data?: string;
  descricao: string;
  finalizado: boolean;
  status: string;
  observacoes: string;
  prioridade?: string;
  valor?: string;
  pago?: boolean;
}
