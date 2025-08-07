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
] as const;

const STATUS_STYLES: Record<typeof STATUS_OPTIONS[number], string> = {
  "Em fila": "bg-gray-600 text-white",
  "Em andamento": "bg-blue-500 text-white",
  "Aguardando peça": "bg-orange-500 text-white",
  "Esperando cliente": "bg-yellow-500 text-black",
  "Pendente de pagamento": "bg-purple-500 text-white",
  Finalizado: "bg-green-600 text-white",
  Entregue: "bg-teal-500 text-white",
  Cancelado: "bg-red-600 text-white",
};

const PRIORITY_OPTIONS = ["Baixa", "Média", "Alta"] as const;

type ServicoRaw = Omit<Servico, "id"> & { id?: number | string | null };

type ServicoComCliente = Omit<Servico, "data"> & {
  id?: string;
  clienteId?: string;
  cliente?: string;
  veiculo?: string;
  prioridade?: string;
  valor?: string;
  pago?: boolean;
  observacoes?: string;
};

function criarServicoVazio(): ServicoComCliente {
  return {
    cliente: "",
    clienteId: "",
    veiculo: "",
    descricao: "",
    finalizado: false,
    status: "Em fila",
    observacoes: "",
    prioridade: "Média",
    valor: "",
    pago: false,
  };
}

export default function ServicosPage() {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>("ver");
  const [servicos, setServicos] = useState<ServicoComCliente[]>([]);
  const [servicoAtual, setServicoAtual] = useState<ServicoComCliente>(
    criarServicoVazio()
  );
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteBusca, setClienteBusca] = useState("");
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);
  const clienteSuggestionRef = useRef<HTMLDivElement | null>(null);

  const [veiculoBusca, setVeiculoBusca] = useState("");
  const [showVeiculoSuggestions, setShowVeiculoSuggestions] = useState(false);
  const veiculoSuggestionRef = useRef<HTMLDivElement | null>(null);

  const [kanbanStatusFilter, setKanbanStatusFilter] = useState<string | null>(null);

  const inputClass =
    "bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded";

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const api = new ApiService();

        // Buscar clientes
        const listaClientes = await api.getClientes();
        const clientesNormalizados = listaClientes.map((c) => ({
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
        setClientes(clientesNormalizados);

        if (viewMode === "ver") {
          const listaServicosRaw = await api.getServicos();

          // Associar nome do cliente
          const servicosComNomeCliente = listaServicosRaw.map((s: ServicoRaw) => {
            const cliente = clientesNormalizados.find((c) => c.id === s.clienteId);
            return {
              ...s,
              id: s.id !== undefined && s.id !== null ? s.id.toString() : undefined,
              cliente: cliente ? cliente.nome : "",
            };
          });

          setServicos(servicosComNomeCliente);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [viewMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        clienteSuggestionRef.current &&
        !clienteSuggestionRef.current.contains(event.target as Node)
      ) {
        setShowClienteSuggestions(false);
      }
      if (
        veiculoSuggestionRef.current &&
        !veiculoSuggestionRef.current.contains(event.target as Node)
      ) {
        setShowVeiculoSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const servicosFiltrados = useMemo(() => {
    return servicos.filter((s) => {
      const bateFiltro = `${s.cliente} ${s.descricao}`
        .toLowerCase()
        .includes(filtro.toLowerCase());
      const bateKanban = kanbanStatusFilter ? s.status === kanbanStatusFilter : true;
      return bateFiltro && bateKanban;
    });
  }, [servicos, filtro, kanbanStatusFilter]);

  const clientesFiltrados = useMemo(() => {
    const busca = clienteBusca || "";
    return busca.trim() === ""
      ? clientes
      : clientes.filter((c) =>
          c.nome.toLowerCase().includes(busca.toLowerCase())
        );
  }, [clientes, clienteBusca]);

  const veiculosDoCliente = useMemo(() => {
    if (!servicoAtual.clienteId) return [];
    const cliente = clientes.find((c) => c.id === servicoAtual.clienteId);
    return cliente?.veiculos ?? [];
  }, [servicoAtual.clienteId, clientes]);

  const veiculosFiltrados = useMemo(() => {
    if (veiculoBusca.trim() === "") return veiculosDoCliente;
    const termo = veiculoBusca.toLowerCase();
    return veiculosDoCliente.filter(
      (v) =>
        v.placa.toLowerCase().includes(termo) ||
        v.modelo.toLowerCase().includes(termo)
    );
  }, [veiculoBusca, veiculosDoCliente]);

  function statusBadge(status: string) {
    const style = STATUS_STYLES[status as typeof STATUS_OPTIONS[number]] || "bg-gray-500 text-white";
    return (
      <span
        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${style}`}
      >
        {status}
      </span>
    );
  }

  async function salvarServico() {
    if (!servicoAtual.cliente.trim() || !servicoAtual.descricao.trim()) {
      alert("Preencha os campos obrigatórios (Cliente e Descrição).");
      return;
    }

    try {
      setLoading(true);
      const api = new ApiService();

      if (servicoAtual.id) {
        // Atualizar serviço
        const response = await api.updateService({
          id: servicoAtual.id,
          cliente: servicoAtual.cliente,
          clienteId: servicoAtual.clienteId,
          veiculo: servicoAtual.veiculo,
          data: new Date().toISOString(),
          descricao: servicoAtual.descricao,
          finalizado: servicoAtual.finalizado,
          status: servicoAtual.status,
          observacoes: servicoAtual.observacoes,
          prioridade: servicoAtual.prioridade,
          valor: servicoAtual.valor,
          pago: servicoAtual.pago,
        });

        if (response.status) {
          alert("Serviço atualizado com sucesso!");
        } else {
          alert(`Erro ao atualizar serviço: ${response.message || "Erro desconhecido"}`);
        }
      } else {
        // Criar serviço
        const { id, ...servicoParaSalvar } = servicoAtual;
        const response = await api.registerService({
          ...servicoParaSalvar,
          data: new Date().toISOString(),
        });

        if (response.status) {
          alert("Serviço cadastrado com sucesso!");
        } else {
          alert(`Erro ao salvar serviço: ${response.message || "Erro desconhecido"}`);
        }
      }

      // Recarregar lista de serviços
      const listaServicosRaw = await api.getServicos();
      const servicosComNomeCliente = listaServicosRaw.map((s: ServicoRaw) => {
        const cliente = clientes.find((c) => c.id === s.clienteId);
        return {
          ...s,
          id: s.id !== undefined && s.id !== null ? s.id.toString() : undefined,
          cliente: cliente ? cliente.nome : "",
        };
      });
      setServicos(servicosComNomeCliente);

      // Resetar formulário e view
      setServicoAtual(criarServicoVazio());
      setClienteBusca("");
      setVeiculoBusca("");
      setViewMode("ver");
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      alert("Erro ao salvar serviço. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }

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

  function selecionarVeiculo(veiculo: Veiculo) {
    const display = `${veiculo.modelo} (${veiculo.placa})`;
    setServicoAtual((prev) => ({
      ...prev,
      veiculo: display,
    }));
    setVeiculoBusca(display);
    setShowVeiculoSuggestions(false);
  }

  function editarServico(servico: ServicoComCliente) {
    setServicoAtual(servico);
    setClienteBusca(servico.cliente ?? "");
    setVeiculoBusca(servico.veiculo || "");
    setViewMode("cadastrar");
  }

  const servicoService = new ApiService();

  async function atualizarStatusServico(id: string, novoStatus: string) {
    try {
      await servicoService.updateService({ id, status: novoStatus });  
      
      setServicos((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: novoStatus } : s))
      );
    } catch (error) {
      console.error('Erro ao atualizar o status:', error);
      alert('Falha ao atualizar o status do serviço.');
    }
  }
  
  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

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
            {/* Botão Voltar para Início - só aparece no modo visualização */}
            {viewMode === "ver" && (
              <Button
                variant="outline"
                className="border border-gray-500 text-gray-200 hover:bg-gray-700"
                onClick={() => router.push("/")}
              >
                ← Voltar para Início
              </Button>
            )}
          </div>

          {viewMode === "ver" && (
            <Input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por cliente ou descrição..."
              className={`${inputClass} max-w-sm`}
            />
          )}
        </div>

        {/* Botão de Voltar para lista - só aparece no modo cadastro/edição */}
        {viewMode === "cadastrar" && (
          <div className="mb-6">
            <Button
              variant="outline"
              className="border border-gray-500 text-gray-200 hover:bg-gray-700"
              onClick={() => {
                setServicoAtual(criarServicoVazio());
                setViewMode("ver");
              }}
            >
              ← Voltar 
            </Button>
          </div>
        )}

        {viewMode === "ver" ? (
          <>
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Filtrar por Status</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded ${
                    !kanbanStatusFilter
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setKanbanStatusFilter(null)}
                  type="button"
                >
                  Todos
                </button>
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`px-3 py-1 rounded ${
                      kanbanStatusFilter === status
                        ? "ring-2 ring-blue-500"
                        : "bg-[#1e293b]"
                    }`}
                    onClick={() => setKanbanStatusFilter(status)}
                  >
                    {statusBadge(status)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicosFiltrados.length > 0 ? (
                servicosFiltrados.map((servico) => (
                  <Card
                    key={servico.id}
                    className="bg-[#1e293b] border border-gray-700"
                  >
                    <CardContent className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p>
                            <strong>Cliente:</strong> {servico.cliente || "-"}
                          </p>
                          <p>
                            <strong>Veículo:</strong> {servico.veiculo || "-"}
                          </p>
                          <p>
                            <strong>Prioridade:</strong> {servico.prioridade || "-"}
                          </p>
                          <p>
                            <strong>Valor:</strong> {servico.valor || "-"}
                          </p>
                          <p>
                            <strong>Pago:</strong> {servico.pago ? "Sim" : "Não"}
                          </p>
                        </div>
                        <div>{statusBadge(servico.status)}</div>
                      </div>

                      <p>
                        <strong>Descrição:</strong> {servico.descricao}
                      </p>

                      {servico.observacoes && (
                        <p>
                          <strong>Observações:</strong> {servico.observacoes}
                        </p>
                      )}

                      <div className="mt-2">
                        <Label className="text-gray-400">Status:</Label>
                        <select
                          value={servico.status}
                          onChange={(e) => {
                            const novoStatus = e.target.value;
                            if (servico.id) {
                              atualizarStatusServico(servico.id, novoStatus);
                            }
                          }}
                          className="mt-1 w-full rounded border border-gray-600 bg-[#0f203d] text-white px-2 py-1 text-sm"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        variant="outline"
                        className="mt-3 w-full"
                        onClick={() => editarServico(servico)}
                      >
                        Editar
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="col-span-full text-center">Nenhum serviço encontrado.</p>
              )}
            </div>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              salvarServico();
            }}
            className="max-w-xl mx-auto bg-[#1e293b] p-6 rounded-md shadow-md"
          >
            <h2 className="text-xl font-semibold mb-6">
              {servicoAtual.id ? "Editar Serviço" : "Cadastrar Serviço"}
            </h2>

            {/* Cliente */}
            <div className="mb-4 relative" ref={clienteSuggestionRef}>
              <Label htmlFor="cliente" className="block mb-1">
                Cliente *
              </Label>
              <Input
                id="cliente"
                type="text"
                value={clienteBusca}
                onChange={(e) => {
                  setClienteBusca(e.target.value);
                  setShowClienteSuggestions(true);
                }}
                onFocus={() => setShowClienteSuggestions(true)}
                className={inputClass}
                required
                autoComplete="off"
              />
              {showClienteSuggestions && clientesFiltrados.length > 0 && (
                <ul className="absolute z-10 bg-[#0f172a] border border-gray-600 max-h-40 overflow-auto w-full rounded-b-md">
                  {clientesFiltrados.map((cliente) => (
                    <li
                      key={cliente.id}
                      onClick={() => selecionarCliente(cliente)}
                      className="px-3 py-2 hover:bg-blue-700 cursor-pointer"
                    >
                      {cliente.nome}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Veículo */}
            <div className="mb-4 relative" ref={veiculoSuggestionRef}>
              <Label htmlFor="veiculo" className="block mb-1">
                Veículo
              </Label>
              <Input
                id="veiculo"
                type="text"
                value={veiculoBusca}
                onChange={(e) => {
                  setVeiculoBusca(e.target.value);
                  setShowVeiculoSuggestions(true);
                }}
                onFocus={() => setShowVeiculoSuggestions(true)}
                className={inputClass}
                autoComplete="off"
              />
              {showVeiculoSuggestions && veiculosFiltrados.length > 0 && (
                <ul className="absolute z-10 bg-[#0f172a] border border-gray-600 max-h-40 overflow-auto w-full rounded-b-md">
                  {veiculosFiltrados.map((veiculo) => (
                    <li
                      key={veiculo.placa}
                      onClick={() => selecionarVeiculo(veiculo)}
                      className="px-3 py-2 hover:bg-blue-700 cursor-pointer"
                    >
                      {veiculo.modelo} ({veiculo.placa})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Descrição */}
            <div className="mb-4">
              <Label htmlFor="descricao" className="block mb-1">
                Descrição *
              </Label>
              <Textarea
                id="descricao"
                value={servicoAtual.descricao}
                onChange={(e) =>
                  setServicoAtual((prev) => ({
                    ...prev,
                    descricao: e.target.value,
                  }))
                }
                className={inputClass}
                required
                rows={4}
              />
            </div>

            {/* Prioridade */}
            <div className="mb-4">
              <Label htmlFor="prioridade" className="block mb-1">
                Prioridade
              </Label>
              <select
                id="prioridade"
                value={servicoAtual.prioridade}
                onChange={(e) =>
                  setServicoAtual((prev) => ({
                    ...prev,
                    prioridade: e.target.value,
                  }))
                }
                className={`${inputClass} w-full rounded`}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div className="mb-4">
              <Label htmlFor="valor" className="block mb-1">
                Valor
              </Label>
              <Input
                id="valor"
                type="text"
                value={servicoAtual.valor}
                onChange={(e) =>
                  setServicoAtual((prev) => ({
                    ...prev,
                    valor: e.target.value,
                  }))
                }
                className={inputClass}
              />
            </div>

            {/* Pago */}
            <div className="mb-4 flex items-center space-x-2">
              <Switch
                id="pago"
                checked={servicoAtual.pago ?? false}
                onCheckedChange={(checked) =>
                  setServicoAtual((prev) => ({
                    ...prev,
                    pago: checked,
                  }))
                }
              />
              <Label htmlFor="pago" className="select-none">
                Pago
              </Label>
            </div>

            {/* Observações */}
            <div className="mb-4">
              <Label htmlFor="observacoes" className="block mb-1">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={servicoAtual.observacoes}
                onChange={(e) =>
                  setServicoAtual((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
                className={inputClass}
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="mb-6">
              <Label htmlFor="status" className="block mb-1">
                Status
              </Label>
              <select
                id="status"
                value={servicoAtual.status}
                onChange={(e) =>
                  setServicoAtual((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className={`${inputClass} w-full rounded`}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {servicoAtual.id ? "Atualizar Serviço" : "Salvar Serviço"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setServicoAtual(criarServicoVazio());
                  setClienteBusca("");
                  setVeiculoBusca("");
                  setViewMode("ver");
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}