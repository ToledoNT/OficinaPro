'use client';

import { Card, CardContent } from "@/app/clientes/components/ui/card";
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

export const ServicoForm = ({ servico, clientes, onSave, onCancel, loading = false }: ServicoFormProps) => {
  const [formData, setFormData] = useState<Servico>(servico);
  const [veiculosCliente, setVeiculosCliente] = useState<Veiculo[]>([]);
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteSugestoes, setClienteSugestoes] = useState<Cliente[]>([]);

  const inputClass = "bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full p-2 rounded";

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
    if (!loading) onSave(formData);
  };

  useEffect(() => {
    const busca = clienteBusca.trim().toLowerCase();
    if (busca === "") {
      setClienteSugestoes([]);
      return;
    }
    const resultados = clientes.filter(c => c.nome.toLowerCase().includes(busca));
    setClienteSugestoes(resultados);

    const clienteExato = clientes.find(c => c.nome.toLowerCase() === busca);
    if (clienteExato) handleClienteSelecionado(clienteExato);
  }, [clienteBusca, clientes]);

  return (
    <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto">
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold">Cadastro / Edição de Serviço</h2>

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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
          />
        </div>

        {/* Prioridade e Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prioridade">Prioridade *</Label>
            <select
              id="prioridade"
              value={formData.prioridade}
              onChange={(e) => handleChange("prioridade", e.target.value as typeof PRIORITY_OPTIONS[number])}
              required
              className={inputClass}
            >
              {PRIORITY_OPTIONS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value as typeof STATUS_OPTIONS[number])}
              required
              className={inputClass}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
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
            className={inputClass}
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
            className={inputClass}
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
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading} className="relative">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Salvando...
              </div>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
