import { Cliente } from "./clientes-interface";
import { Servico } from "./service-interface";

export type Conta = {
  id?: number;
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
  servicoId?: string; 
  clienteNome: string;  
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
  servicoId?: string;
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
  onSalvar: (conta: Conta) => void;
  onClienteChange?: (clienteId: string) => void; 
  loadingClientes?: boolean;
  errorClientes?: string | null;
  readonly?: boolean; 
}

export interface ContaCardProps {
  conta: Conta;
  formatarValor: (valor: string) => string;
  onVer: () => void;
  onEditar: (conta: Conta) => void; 
  onDelete: (id: number) => void;  
  loading?: boolean;
}

export interface ApiResponseDeleteConta {
  mensagem: string;
  dados: {
    status: boolean;
    code: number;
    message: string;
    data: null;
  };
}