'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Card, CardContent } from "../components/ui/card";

import { Servico } from "../interfaces/service-interface";
import { Cliente, Veiculo } from "../interfaces/clientes-interface";
import { ApiService } from "@/api/api-requests";

type ViewMode = "ver" | "cadastrar";

const STATUS_OPTIONS = [
  "Em fila",
  "Em andamento",
  "Aguardando peça",
  "Esperando cliente",
  "Pendente de pagamento",
  "Finalizado",
  "Entregue",
  "Cancelado",
];

const STATUS_STYLES: Record<string, string> = {
  "Em fila": "bg-gray-600 text-white",
  "Em andamento": "bg-blue-500 text-white",
  "Aguardando peça": "bg-orange-500 text-white",
  "Esperando cliente": "bg-yellow-500 text-black",
  "Pendente de pagamento": "bg-purple-500 text-white",
  Finalizado: "bg-green-600 text-white",
  Entregue: "bg-teal-500 text-white",
  Cancelado: "bg-red-600 text-white",
};

const PRIORITY_OPTIONS = ["Baixa", "Média", "Alta"];

type ServicoComCliente = Servico & {
  clienteId?: string;
  veiculo?: string;
  prioridade?: string;
  valor?: string;
  pago?: string;
};

function criarServicoVazio(): ServicoComCliente {
  return {
    id: Date.now(),
    cliente: "",
    clienteId: "",
    veiculo: "",
    data: "",
    descricao: "",
    finalizado: false,
    status: "Em fila",
    observacoes: "",
    prioridade: "Média",
    valor: "",
    pago: "",
  };
}

export default function ServicosPage() {
  const router = useRouter();

  // Estados principais
  const [viewMode, setViewMode] = useState<ViewMode>("ver");
  const [servicos, setServicos] = useState<ServicoComCliente[]>([]);
  const [servicoAtual, setServicoAtual] = useState<ServicoComCliente>(criarServicoVazio());
  const [filtro, setFiltro] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteBusca, setClienteBusca] = useState("");
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);
  const clienteSuggestionRef = useRef<HTMLDivElement | null>(null);

  const [veiculoBusca, setVeiculoBusca] = useState("");
  const [showVeiculoSuggestions, setShowVeiculoSuggestions] = useState(false);
  const veiculoSuggestionRef = useRef<HTMLDivElement | null>(null);

  const [kanbanStatusFilter, setKanbanStatusFilter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const inputClass =
    "bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  // Carregar clientes e normalizar dados na montagem
  useEffect(() => {
    async function carregarClientes() {
      try {
        const api = new ApiService();
        const lista = await api.getClientes();

        const normalizados = lista.map((c) => ({
          ...c,
          veiculos: Array.isArray(c.veiculos) ? c.veiculos : [],
          endereco: {
            rua: c.endereco?.rua ?? "",
            numero: c.endereco?.numero ?? "",
            bairro: c.endereco?.bairro ?? "",
            cidade: c.endereco?.cidade ?? "",
            estado: c.endereco?.estado ?? "",
            cep: c.endereco?.cep ?? "",
          },
        }));

        setClientes(normalizados);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    }

    carregarClientes();
  }, []);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clienteSuggestionRef.current && !clienteSuggestionRef.current.contains(event.target as Node)) {
        setShowClienteSuggestions(false);
      }
      if (veiculoSuggestionRef.current && !veiculoSuggestionRef.current.contains(event.target as Node)) {
        setShowVeiculoSuggestions(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar serviços pelo filtro de texto e status kanban
  const servicosFiltrados = useMemo(() => {
    return servicos.filter((s) => {
      const bateFiltro =
        `${s.cliente} ${s.descricao}`.toLowerCase().includes(filtro.toLowerCase());
      const bateKanban = kanbanStatusFilter ? s.status === kanbanStatusFilter : true;
      return bateFiltro && bateKanban;
    });
  }, [servicos, filtro, kanbanStatusFilter]);

  // Filtrar clientes conforme busca
  const clientesFiltrados = useMemo(() => {
    if (clienteBusca.trim() === "") return clientes;
    return clientes.filter((c) =>
      c.nome.toLowerCase().includes(clienteBusca.toLowerCase())
    );
  }, [clientes, clienteBusca]);

  // Veículos do cliente selecionado
  const veiculosDoCliente = useMemo(() => {
    if (!servicoAtual.clienteId) return [];
    const cliente = clientes.find((c) => c.id === servicoAtual.clienteId);
    return cliente?.veiculos ?? [];
  }, [servicoAtual.clienteId, clientes]);

  // Filtrar veículos conforme busca
  const veiculosFiltrados = useMemo(() => {
    if (veiculoBusca.trim() === "") return veiculosDoCliente;
    const termo = veiculoBusca.toLowerCase();
    return veiculosDoCliente.filter(
      (v) =>
        v.placa.toLowerCase().includes(termo) ||
        v.modelo.toLowerCase().includes(termo)
    );
  }, [veiculoBusca, veiculosDoCliente]);

  // Componente Badge para status
  function statusBadge(status: string) {
    const style = STATUS_STYLES[status] || "bg-gray-500 text-white";
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${style}`}>
        {status}
      </span>
    );
  }

  // Salvar ou atualizar serviço
  function salvarServico() {
    if (!servicoAtual.cliente.trim() || !servicoAtual.data || !servicoAtual.descricao) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    setServicos((prev) => {
      const existe = prev.some((s) => s.id === servicoAtual.id);
      return existe
        ? prev.map((s) => (s.id === servicoAtual.id ? servicoAtual : s))
        : [...prev, servicoAtual];
    });

    alert("Serviço registrado com sucesso!");
    setServicoAtual(criarServicoVazio());
    setClienteBusca("");
    setVeiculoBusca("");
    setViewMode("ver");
  }

  // Selecionar cliente da lista
  function selecionarCliente(cliente: Cliente) {
    setServicoAtual((prev) => ({
      ...prev,
      cliente: cliente.nome,
      clienteId: cliente.id,
      veiculo: "",
    }));
    setClienteBusca(cliente.nome);
    setVeiculoBusca("");
    setShowClienteSuggestions(false);
  }

  // Selecionar veículo da lista
  function selecionarVeiculo(veiculo: Veiculo) {
    const display = `${veiculo.modelo} (${veiculo.placa})`;
    setServicoAtual((prev) => ({
      ...prev,
      veiculo: display,
    }));
    setVeiculoBusca(display);
    setShowVeiculoSuggestions(false);
  }

  // Editar serviço
  function editarServico(s: ServicoComCliente) {
    setServicoAtual(s);
    setClienteBusca(s.cliente);
    setVeiculoBusca(s.veiculo || "");
    setViewMode("cadastrar");
  }

  // Expandir / recolher detalhes
  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Ações principais */}
        <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
          <div className="space-x-4">
            <Button
              onClick={() => setViewMode("ver")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ver Serviços
            </Button>

            <Button
              onClick={() => {
                setServicoAtual(criarServicoVazio());
                setClienteBusca("");
                setVeiculoBusca("");
                setViewMode("cadastrar");
                setKanbanStatusFilter(null);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Cadastrar Serviço
            </Button>

            <Button
              variant="outline"
              className="border border-gray-500 text-gray-200 hover:bg-gray-700"
              onClick={() => router.push("/")}
            >
              ← Voltar para Início
            </Button>
          </div>

          {viewMode === "ver" && (
            <Input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por cliente ou descrição..."
              className={inputClass + " max-w-sm"}
            />
          )}
        </div>

        {/* Kanban - filtro por status */}
        {viewMode === "ver" && (
          <>
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Kanban - Filtrar por Status</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`flex items-center gap-1 px-3 py-1 rounded ${
                    kanbanStatusFilter === null
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setKanbanStatusFilter(null)}
                >
                  Todos
                </button>
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${
                      kanbanStatusFilter === status
                        ? "ring-2 ring-offset-1 ring-white"
                        : "bg-[#1e293b] hover:bg-[#273656]"
                    }`}
                    onClick={() => setKanbanStatusFilter(status)}
                  >
                    {statusBadge(status)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicosFiltrados.length === 0 ? (
                <p>Nenhum serviço encontrado.</p>
              ) : (
                servicosFiltrados.map((s) => (
                  <Card
                    key={s.id}
                    className="bg-[#1e293b] border border-gray-700 relative"
                  >
                    <CardContent className="p-4 space-y-2 text-sm text-gray-300 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p>
                            <strong>Cliente:</strong> {s.cliente}
                          </p>
                          <p>
                            <strong>Veículo:</strong> {s.veiculo || "-"}
                          </p>
                          <p>
                            <strong>Prioridade:</strong> {s.prioridade || "-"}
                          </p>
                          <p>
                            <strong>Valor:</strong> {s.valor || "-"}
                          </p>
                          <p>
                            <strong>Pago:</strong> {s.pago || "-"}
                          </p>
                        </div>
                        <div>{statusBadge(s.status)}</div>
                      </div>

                      <p>
                        <strong>Data:</strong> {s.data}
                      </p>
                      <p>
                        <strong>Descrição:</strong> {s.descricao}
                      </p>

                      <div>
                        <Label className="text-gray-400">Mudar status:</Label>
                        <select
                          value={s.status}
                          onChange={(e) => {
                            const novoStatus = e.target.value;
                            setServicos((prev) =>
                              prev.map((item) =>
                                item.id === s.id
                                  ? { ...item, status: novoStatus }
                                  : item
                              )
                            );
                          }}
                          className="mt-1 w-full rounded border border-gray-600 bg-[#0f203d] text-white px-2 py-1 text-sm focus:outline-none"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <p>
                        <strong>Finalizado:</strong> {s.finalizado ? "Sim" : "Não"}
                      </p>
                      <p>
                        <strong>Observações:</strong> {s.observacoes || "-"}
                      </p>

                      {expandedId === s.id && (
                        <div className="bg-[#0f1f45] p-3 rounded mt-2 text-xs">
                          <p className="font-semibold">Histórico / Detalhes:</p>
                          <p>Cliente selecionado: {s.cliente}</p>
                          <p>Veículo vinculado: {s.veiculo || "-"}</p>
                          <p>Status atual: {s.status}</p>
                          <p>Prioridade: {s.prioridade || "-"}</p>
                          <p>Valor: {s.valor || "-"}</p>
                          <p>Pago: {s.pago || "-"}</p>
                        </div>
                      )}

                      {/* Botões */}
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          className="text-yellow-400 border-yellow-400 hover:bg-yellow-600 hover:text-white text-xs"
                          onClick={() => toggleExpand(s.id)}
                        >
                          {expandedId === s.id ? "Fechar" : "Ver"}
                        </Button>
                        <Button
                          variant="outline"
                          className="text-cyan-300 border-cyan-300 hover:bg-cyan-600 hover:text-white text-xs"
                          onClick={() => editarServico(s)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-500 border-red-500 hover:bg-red-600 hover:text-white text-xs"
                          onClick={() => {
                            if (confirm("Confirma exclusão deste serviço?")) {
                              setServicos((prev) => prev.filter((x) => x.id !== s.id));
                            }
                          }}
                        >
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {/* Formulário de cadastro / edição */}
        {viewMode === "cadastrar" && (
          <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto">
            <CardContent className="space-y-6">
              <h2 className="text-2xl font-semibold">
                {servicoAtual.id && servicos.some((s) => s.id === servicoAtual.id)
                  ? "Editar Serviço"
                  : "Cadastrar Serviço"}
              </h2>

              {/* Cliente */}
              <div className="relative">
                <Label>Cliente *</Label>
                <Input
                  placeholder="Selecione o cliente..."
                  value={clienteBusca}
                  onChange={(e) => {
                    setClienteBusca(e.target.value);
                    setShowClienteSuggestions(true);
                    setServicoAtual((prev) => ({
                      ...prev,
                      cliente: e.target.value,
                      clienteId: "",
                      veiculo: "",
                    }));
                  }}
                  className={inputClass}
                  onFocus={() => setShowClienteSuggestions(true)}
                  autoComplete="off"
                />
                {showClienteSuggestions && clientesFiltrados.length > 0 && (
                  <div
                    ref={(el) => {
                      clienteSuggestionRef.current = el ?? null;
                    }}
                    className="absolute z-20 w-full bg-[#1e293b] border border-gray-600 rounded mt-1 max-h-52 overflow-auto"
                  >
                    {clientesFiltrados.map((c) => (
                      <div
                        key={c.id}
                        className="px-3 py-2 hover:bg-gray-800 cursor-pointer"
                        onClick={() => selecionarCliente(c)}
                      >
                        {c.nome}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Veículo */}
              <div className="relative">
                <Label>Veículo</Label>
                <Input
                  placeholder="Escolha o veículo..."
                  value={veiculoBusca}
                  onChange={(e) => {
                    setVeiculoBusca(e.target.value);
                    setShowVeiculoSuggestions(true);
                    setServicoAtual((prev) => ({ ...prev, veiculo: e.target.value }));
                  }}
                  className={inputClass}
                  onFocus={() => setShowVeiculoSuggestions(true)}
                  autoComplete="off"
                  disabled={!servicoAtual.clienteId}
                />
                {showVeiculoSuggestions && veiculosFiltrados.length > 0 && (
                  <div
                    ref={(el) => {
                      veiculoSuggestionRef.current = el ?? null;
                    }}
                    className="absolute z-20 w-full bg-[#1e293b] border border-gray-600 rounded mt-1 max-h-52 overflow-auto"
                  >
                    {veiculosFiltrados.map((v, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 hover:bg-gray-800 cursor-pointer"
                        onClick={() => selecionarVeiculo(v)}
                      >
                        {v.modelo} — {v.placa}
                      </div>
                    ))}
                  </div>
                )}
                {!servicoAtual.clienteId && (
                  <p className="text-xs text-gray-400 mt-1">Selecione um cliente para listar veículos</p>
                )}
              </div>

              {/* Data */}
              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={servicoAtual.data}
                  onChange={(e) =>
                    setServicoAtual((prev) => ({ ...prev, data: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              {/* Descrição */}
              <div>
                <Label>Descrição *</Label>
                <Textarea
                  placeholder="Descreva o serviço"
                  value={servicoAtual.descricao}
                  onChange={(e) =>
                    setServicoAtual((prev) => ({ ...prev, descricao: e.target.value }))
                  }
                  className={inputClass}
                  rows={4}
                />
              </div>

              {/* Prioridade */}
              <div>
                <Label>Prioridade</Label>
                <select
                  value={servicoAtual.prioridade}
                  onChange={(e) =>
                    setServicoAtual((prev) => ({ ...prev, prioridade: e.target.value }))
                  }
                  className="w-full rounded border border-gray-600 bg-[#1e293b] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Valor */}
              <div>
                <Label>Valor</Label>
                <Input
                  type="text"
                  placeholder="Valor do serviço"
                  value={servicoAtual.valor}
                  onChange={(e) =>
                    setServicoAtual((prev) => ({ ...prev, valor: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              {/* Pago */}
              <div>
                <Label>Pago</Label>
                <select
                  value={servicoAtual.pago}
                  onChange={(e) =>
                    setServicoAtual((prev) => ({ ...prev, pago: e.target.value }))
                  }
                  className="w-full rounded border border-gray-600 bg-[#1e293b] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <Label>Observações</Label>
                <Textarea
                  placeholder="Observações adicionais"
                  value={servicoAtual.observacoes}
                  onChange={(e) =>
                    setServicoAtual((prev) => ({ ...prev, observacoes: e.target.value }))
                  }
                  className={inputClass}
                  rows={3}
                />
              </div>

              {/* Finalizado */}
              <div className="flex items-center gap-3">
                <Switch
                  checked={servicoAtual.finalizado}
                  onCheckedChange={(checked) =>
                    setServicoAtual((prev) => ({ ...prev, finalizado: checked ?? false }))
                  }
                />
                <Label>Finalizado</Label>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  className="border border-gray-500 text-gray-300 hover:bg-gray-700"
                  onClick={() => setViewMode("ver")}
                >
                  Cancelar
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={salvarServico}>
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
