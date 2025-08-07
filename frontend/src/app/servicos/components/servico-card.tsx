import { Servico, STATUS_OPTIONS } from "@/app/interfaces/service-interface";
import { StatusBadge } from "./status-badge";
import { Button } from "@/app/clientes/components/ui/button";

interface ServicoCardProps {
  servico: Servico;
  onEdit: () => void;
  onStatusChange: (status: string) => void;
}

export const ServicoCard = ({ servico, onEdit, onStatusChange }: ServicoCardProps) => {
  return (
    <div className="bg-[#1e293b] border border-gray-700 rounded-md p-4 space-y-2 text-sm">
      <div className="flex justify-between items-start gap-2">
        <div>
          <p><strong>Cliente:</strong> {servico.cliente || "-"}</p>
          <p><strong>Veículo:</strong> {servico.veiculo || "-"}</p>
          <p><strong>Prioridade:</strong> {servico.prioridade || "-"}</p>
          <p><strong>Valor:</strong> {servico.valor || "-"}</p>
          <p><strong>Pago:</strong> {servico.pago ? "Sim" : "Não"}</p>
        </div>
        <StatusBadge status={servico.status} />
      </div>

      <p><strong>Descrição:</strong> {servico.descricao}</p>

      {servico.observacoes && (
        <p><strong>Observações:</strong> {servico.observacoes}</p>
      )}

      <select
        value={servico.status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="mt-2 w-full rounded border border-gray-600 bg-[#0f203d] text-white px-2 py-1 text-sm"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>

      <Button variant="outline" className="mt-3 w-full" onClick={onEdit}>
        Editar
      </Button>
    </div>
  );
};