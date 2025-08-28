import { Servico, StatusType } from "@/app/interfaces/service-interface";

export const criarServicoVazio = (): Servico => ({
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
});


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