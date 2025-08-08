import { Button } from "@/app/clientes/components/ui/button";
import { Input } from "@/app/clientes/components/ui/input";
import { Label } from "@/app/clientes/components/ui/label";
import { Textarea } from "@/app/clientes/components/ui/textarea";
import { Cliente } from "@/app/interfaces/clientes-interface";
import { Servico, STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/app/interfaces/service-interface";
import { useState, useEffect } from "react";

interface ServicoFormProps {
  servico: Servico;
  clientes: Cliente[];
  onSave: (servico: Servico) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ServicoForm = ({ servico, clientes, onSave, onCancel, loading }: ServicoFormProps) => {
  const [formData, setFormData] = useState<Servico>(servico);

  useEffect(() => {
    setFormData(servico);
  }, [servico]);

  // Tipagem genérica para evitar 'any' e garantir o tipo correto do valor
  const handleChange = <K extends keyof Servico>(field: K, value: Servico[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-[#1e293b] p-6 rounded-md shadow-md space-y-6">

      {/* Cliente */}
      <div>
        <Label htmlFor="clienteId">Cliente *</Label>
        <select
          id="clienteId"
          value={formData.clienteId}
          onChange={(e) => handleChange("clienteId", e.target.value)}
          required
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          <option value="">Selecione o cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      {/* Veículo */}
      <div>
        <Label htmlFor="veiculo">Veículo</Label>
        <Input
          id="veiculo"
          value={formData.veiculo || ""}
          onChange={(e) => handleChange("veiculo", e.target.value)}
          placeholder="Informe o veículo"
        />
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => handleChange("descricao", e.target.value)}
          required
          rows={4}
        />
      </div>

      {/* Prioridade */}
      <div>
        <Label htmlFor="prioridade">Prioridade *</Label>
        <select
          id="prioridade"
          value={formData.prioridade}
          onChange={(e) => handleChange("prioridade", e.target.value as typeof PRIORITY_OPTIONS[number])}
          required
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          {PRIORITY_OPTIONS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <Label htmlFor="status">Status *</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => handleChange("status", e.target.value as typeof STATUS_OPTIONS[number])}
          required
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Valor */}
      <div>
        <Label htmlFor="valor">Valor</Label>
        <Input
          id="valor"
          type="number"
          step="0.01"
          value={formData.valor || ""}
          onChange={(e) => handleChange("valor", e.target.value)}
          placeholder="Informe o valor"
        />
      </div>

      {/* Observações */}
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes || ""}
          onChange={(e) => handleChange("observacoes", e.target.value)}
          rows={3}
        />
      </div>

      {/* Finalizado */}
      <div className="flex items-center space-x-2">
        <input
          id="finalizado"
          type="checkbox"
          checked={formData.finalizado}
          onChange={(e) => handleChange("finalizado", e.target.checked)}
          className="w-4 h-4"
        />
        <Label htmlFor="finalizado" className="mb-0">Finalizado</Label>
      </div>

      {/* Pago */}
      <div className="flex items-center space-x-2">
        <input
          id="pago"
          type="checkbox"
          checked={formData.pago}
          onChange={(e) => handleChange("pago", e.target.checked)}
          className="w-4 h-4"
        />
        <Label htmlFor="pago" className="mb-0">Pago</Label>
      </div>

      {/* Botões */}
      <div className="flex justify-between mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};