import { Button } from "@/app/clientes/components/ui/button";
import { Input } from "@/app/clientes/components/ui/input";
import { Label } from "@/app/clientes/components/ui/label";
import { Textarea } from "@/app/clientes/components/ui/textarea";
import { Cliente, Veiculo } from "@/app/interfaces/clientes-interface";
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
  const [veiculosCliente, setVeiculosCliente] = useState<Veiculo[]>([]);
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteSugestoes, setClienteSugestoes] = useState<Cliente[]>([]);

  useEffect(() => {
    setFormData(servico);
    const clienteSelecionado = clientes.find(c => c.id === servico.clienteId);
    setClienteBusca(clienteSelecionado?.nome || "");
    setVeiculosCliente(clienteSelecionado?.veiculos || []);
  }, [servico, clientes]);

  const handleClienteSelecionado = (cliente: Cliente) => {
    setFormData(prev => ({
      ...prev,
      clienteId: cliente.id,
      veiculo: "",
    }));
    setClienteBusca(cliente.nome);
    setVeiculosCliente(cliente.veiculos || []);
    setClienteSugestoes([]);
  };

  const handleChange = <K extends keyof Servico>(field: K, value: Servico[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  useEffect(() => {
    const busca = clienteBusca.trim().toLowerCase();

    if (busca === "") {
      setClienteSugestoes([]);
      return;
    }

    const resultados = clientes.filter(c =>
      c.nome.toLowerCase().includes(busca)
    );
    setClienteSugestoes(resultados);

    const clienteExato = clientes.find(c => c.nome.toLowerCase() === busca);
    if (clienteExato) {
      handleClienteSelecionado(clienteExato);
    }
  }, [clienteBusca, clientes]);

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-[#1e293b] p-6 rounded-md shadow-md space-y-6">
      {/* Cliente */}
      <div className="relative">
        <Label htmlFor="clienteBusca">Cliente *</Label>
        <Input
          id="clienteBusca"
          type="text"
          value={clienteBusca}
          onChange={(e) => setClienteBusca(e.target.value)}
          placeholder="Digite o nome do cliente"
          required
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        {clienteSugestoes.length > 0 && (
          <ul className="absolute z-10 bg-white text-black w-full mt-1 border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto">
            {clienteSugestoes.map((c) => (
              <li
                key={c.id}
                className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleClienteSelecionado(c)}
              >
                {c.nome}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Veículo */}
      <div>
        <Label htmlFor="veiculo">Veículo</Label>
        <select
          id="veiculo"
          value={formData.veiculo || ""}
          onChange={(e) => handleChange("veiculo", e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          disabled={veiculosCliente.length === 0}
        >
          <option value="">Selecione o veículo</option>
          {veiculosCliente.map((v) => (
            <option key={v.placa} value={v.placa}>
              {v.modelo} - {v.placa}
            </option>
          ))}
        </select>
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