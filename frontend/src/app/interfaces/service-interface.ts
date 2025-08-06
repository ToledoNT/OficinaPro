export interface Servico {
  id: number;
  cliente: string;
  clienteId?: string; 
  veiculo?: string;  
  data: string;
  descricao: string;
  finalizado: boolean;
  status: string;
  observacoes: string;
  prioridade?: string;  // adicionado para ser compatível
  valor?: string;      // adicionado para ser compatível
  pago?: string;       // adicionado para ser compatível
}
