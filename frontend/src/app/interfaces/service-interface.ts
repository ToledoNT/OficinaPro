import { Cliente } from "./clientes-interface";

// Opções de status como constante com const assertion
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

// Opções de prioridade como constante
export const PRIORITY_OPTIONS = ["Baixa", "Média", "Alta"] as const;

// Tipos derivados das constantes
export type StatusType = typeof STATUS_OPTIONS[number];
export type PriorityType = typeof PRIORITY_OPTIONS[number];

// Atualizando a interface Servico para incluir o campo 'dataCadastro'
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
  data?: string; // Data opcional, se necessário
  dataCadastro?: string; // Campo para armazenar a data de cadastro
}

// Tipos para operações CRUD
export interface IRegisterServiceData extends Omit<Servico, "id" | "dataCadastro"> {
  data?: string; // opcional mesmo no registro
}

export interface IUpdateServiceData extends Partial<Servico> {
  id: string; // obrigatório para update
}

// Tipo para modo de visualização
export type ViewMode = "ver" | "cadastrar" | "editar";

// Estilos para cada status
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

// Função para criar um serviço vazio com valores padrão
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
    dataCadastro: new Date().toISOString(), // Definindo data de criação
  };
}

// Interface genérica para resposta da API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Alias para respostas específicas
export type ApiResponseServico = ApiResponse<Servico>;
export type ApiResponseCliente = ApiResponse<Cliente[]>;

// Props para lista de serviços
export interface ServicoListProps {
  servicos: Servico[];
  statusFilter: StatusType | null;
  onStatusChange: (id: string, status: StatusType) => void;
  onEdit: (servico: Servico) => void;
  onDelete?: (servicoId: string) => void; // Torna opcional para compatibilidade
  onStatusFilterChange: (status: StatusType | null) => void;
}
