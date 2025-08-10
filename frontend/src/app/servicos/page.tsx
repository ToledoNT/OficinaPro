'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../clientes/components/ui/button";
import { Servico } from "../interfaces/service-interface";
import { Input } from "../clientes/components/ui/input";
import { ServicoForm } from "./components/servico-form";
import { useServicos } from "./hook/service-create";
import { ServicoList } from "./components/servico-list";
import { StatusType } from "../interfaces/service-interface";

export default function ServicosPage() {
  const router = useRouter();
  const {
    viewMode,
    setViewMode,
    servicosFiltrados,
    servicoAtual,
    setServicoAtual,
    clientes,
    filtro,
    setFiltro,
    statusFilter,
    setStatusFilter,
    loading,
    salvarServico,
    atualizarStatus,
    deletarServico,
    criarServicoVazio,
  } = useServicos();

  const [mostrarServicos, setMostrarServicos] = useState(false);
  const [servicoVisualizar, setServicoVisualizar] = useState<Servico | null>(null);

  const handleSave = async (servico: Servico) => {
    const success = await salvarServico(servico);
    if (success) {
      setServicoAtual(criarServicoVazio());
      setViewMode("ver");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Botões */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            {viewMode === "ver" && (
              <>
                <Button
                  variant="solid"
                  onClick={() => {
                    setMostrarServicos(true);
                    setViewMode("ver");
                  }}
                  className="shadow-lg"
                >
                  Ver Serviços
                </Button>
                <Button
                  variant="solid"
                  onClick={() => {
                    setServicoAtual(criarServicoVazio());
                    setViewMode("cadastrar");
                  }}
                >
                  Cadastrar Serviço
                </Button>
              </>
            )}
            {viewMode !== "ver" && (
              <Button
                variant="outline"
                onClick={() => {
                  setServicoAtual(criarServicoVazio());
                  setViewMode("ver");
                  setMostrarServicos(false);
                }}
              >
                ← Voltar
              </Button>
            )}
            {viewMode === "ver" && (
              <Button
                variant="outline"
                className="border border-gray-500 text-gray-200 hover:bg-gray-700
                  shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={() => router.push("/")}
              >
                ← Voltar para tela inicial
              </Button>
            )}
          </div>
        </div>

        {/* Campo de busca */}
        {mostrarServicos && viewMode === "ver" && (
          <div className="mb-10">
            <Input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar serviços..."
              className="w-full max-w-md rounded-lg bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition-shadow duration-300"
            />
          </div>
        )}

        {/* Conteúdo principal */}
        {mostrarServicos && viewMode === "ver" ? (
          <>
            <ServicoList
              servicos={servicosFiltrados}
              clientes={clientes}    
              statusFilter={statusFilter as StatusType | null}
              onStatusChange={atualizarStatus}
              onEdit={(servico: Servico) => {
                setServicoAtual(servico);
                setViewMode("cadastrar");
              }}
              onDelete={async (id: string) => {
                await deletarServico(id);
              }}
              onView={(servico) => setServicoVisualizar(servico)}
              onStatusFilterChange={(status: StatusType | null) => {
                setStatusFilter(status);
              }}
            />

            {/* Modal visualização */}
            {servicoVisualizar && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                <div className="bg-[#1e293b] p-6 rounded-lg max-w-md w-full space-y-4">
                  <h2 className="text-xl font-bold">Detalhes do Serviço</h2>
                  <p><strong>Cliente:</strong> {servicoVisualizar.cliente}</p>
                  <p><strong>Veículo:</strong> {servicoVisualizar.veiculo}</p>
                  <p><strong>Status:</strong> {servicoVisualizar.status}</p>
                  <p><strong>Descrição:</strong> {servicoVisualizar.descricao}</p>
                  {servicoVisualizar.observacoes && (
                    <p><strong>Observações:</strong> {servicoVisualizar.observacoes}</p>
                  )}
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setServicoVisualizar(null)}>
                      Fechar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          viewMode !== "ver" && (
            <ServicoForm
              servico={servicoAtual}
              clientes={clientes}
              onSave={handleSave}
              onCancel={() => {
                setServicoAtual(criarServicoVazio());
                setViewMode("ver");
                setMostrarServicos(true);
              }}
              loading={loading}
            />
          )
        )}
      </div>
    </div>
  );
}