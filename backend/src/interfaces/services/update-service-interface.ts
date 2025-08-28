export interface IUpdateService {
  id: string;               
  clienteId?: string;
  veiculo?: string;
  dataCadastro?: string | Date; 
  descricao?: string;
  finalizado?: boolean;
  status?: string;
  observacoes?: string;
  prioridade?: string;
  valor?: string;
  pago?: boolean;
}