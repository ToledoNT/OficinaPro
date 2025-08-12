import { Cliente } from "./clientes-interface";
import { Servico } from "./service-interface";

export interface ContaCardProps {
  conta: Conta;
  formatarValor: (valor: string) => string;
  onEditar: (conta: Conta) => void;
  onExcluir: (id: number) => void;
}

export type Conta = {
  id?: number;
  dataPagamento: string;
  clienteId?: string;       // mudou para string
  cliente: string;
  descricao: string;
  categoria: string;
  tipo: 'A pagar' | 'A receber';
  valor: string;
  pago: boolean;
  observacoes: string;
  temServico: boolean;
  servicoVinculado: string;
  servicoId?: string;       // mudou para string
};


export interface IRegisterContaData {
  dataPagamento: string;
  clienteId?: string;
  cliente: string;
  descricao: string;
  categoria: string;
  tipo: 'A pagar' | 'A receber';
  valor: string;
  pago: boolean;
  observacoes: string;
  temServico: boolean;
  servicoVinculado: string;
}

export interface ContaFormProps {
  conta: Conta;
  clientes: Cliente[];
  servicos: Servico[];
  inputClass: string;
  onChange: <K extends keyof Conta>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: K
  ) => void;
  onChangeValue: <K extends keyof Conta>(field: K, value: Conta[K]) => void;
  onTogglePago: (checked: boolean) => void;
  onToggleTemServico: (checked: boolean) => void;
  onCancelar: () => void;
  onSalvar: (dados: Conta) => void;  
}
