import { Cliente } from "./clientes-interface";

export const STATUS_OPTIONS = [
  "Em fila",
  "Em andamento",
  "Aguardando peça",
  "Esperando cliente",
  "Pendente de pagamento",
  "Finalizado",
  "Entregue",
  "Cancelado",
] as const;

export const PRIORITY_OPTIONS = ["Baixa", "Média", "Alta"] as const;

export type StatusType = typeof STATUS_OPTIONS[number];
export type PriorityType = typeof PRIORITY_OPTIONS[number];

export interface Servico {
  id?: string;
  clienteId: string;
  cliente?: string;  
  veiculo?: string;  
  descricao: string;
  finalizado: boolean;
  status: StatusType;
  observacoes?: string;
  prioridade: PriorityType;
  valor?: string;
  pago: boolean;
  data?: string; 
  dataCadastro?: string; 
}

export interface IRegisterServiceData extends Omit<Servico, "id" | "dataCadastro"> {
  data?: string;
}

export interface IUpdateServiceData extends Partial<Servico> {
  id: string;
}

export type ViewMode = "ver" | "cadastrar" | "editar";

export const STATUS_STYLES: Record<StatusType, string> = {
  "Em fila": "bg-gray-600 text-white",
  "Em andamento": "bg-blue-500 text-white",
  "Aguardando peça": "bg-orange-500 text-white",
  "Esperando cliente": "bg-yellow-500 text-black",
  "Pendente de pagamento": "bg-purple-500 text-white",
  "Finalizado": "bg-green-600 text-white",
  "Entregue": "bg-teal-500 text-white",
  "Cancelado": "bg-red-600 text-white",
};

export function createEmptyService(): Servico {
  return {
    clienteId: "",
    cliente: "",
    veiculo: "",
    descricao: "",
    finalizado: false,
    status: "Em fila",
    observacoes: "",
    prioridade: "Média",
    valor: "",
    pago: false,
    dataCadastro: new Date().toISOString(),
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export type ApiResponseServico = ApiResponse<Servico>;
export type ApiResponseCliente = ApiResponse<Cliente[]>;

export interface ServicoListProps {
  servicos: Servico[];
  statusFilter: StatusType | null;
  onStatusChange: (id: string, status: StatusType) => void;
  onEdit: (servico: Servico) => void;
  onDelete?: (servicoId: string) => void;
  onStatusFilterChange: (status: StatusType | null) => void;
}

export interface ServicoCardProps {
  servico: Servico;
  onEdit: () => void;
  onStatusChange: (status: string) => void;
}

export interface ServicoFormProps {
  servico: Servico;
  clientes: Cliente[];
  onSave: (servico: Servico) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface StatusBadgeProps {
  status: StatusType;
}