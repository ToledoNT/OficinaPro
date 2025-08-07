'use client';

import { useRouter } from "next/navigation";
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

        {/* Linha dos botões */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">

            {/* Ver Serviços - Sempre azul (solid), mesmo clicado */}
            <Button
              variant="solid"
              onClick={() => setViewMode("ver")}
              // não usa disabled para evitar efeito "apagado"
              className={viewMode === "ver" ? "shadow-lg" : ""}
            >
              Ver Serviços
            </Button>

            {/* Cadastrar Serviço - Sempre azul (solid), mesmo clicado */}
            <Button
              variant="solid"
              onClick={() => {
                setServicoAtual(criarServicoVazio());
                setViewMode("cadastrar");
              }}
              className={viewMode === "cadastrar" ? "shadow-lg" : ""}
            >
              Cadastrar Serviço
            </Button>

            {/* Voltar para tela inicial (contorno, sem preenchimento) */}
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
        {viewMode === "ver" && (
          <div className="mb-10">
            <Input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar serviços..."
              className="w-full max-w-md rounded-lg bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition-shadow duration-300"
            />
          </div>
        )}

        {/* Botão Voltar (modo cadastrar/editar) */}
        {viewMode !== "ver" && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => {
                setServicoAtual(criarServicoVazio());
                setViewMode("ver");
              }}
            >
              ← Voltar
            </Button>
          </div>
        )}

        {/* Conteúdo principal */}
        {viewMode === "ver" ? (
          <ServicoList
            servicos={servicosFiltrados}
            statusFilter={statusFilter as StatusType | null}
            onStatusChange={atualizarStatus}
            onEdit={(servico: Servico) => {
              setServicoAtual(servico);
              setViewMode("cadastrar");
            }}
            onDelete={(servicoId: string) => {
              deletarServico(servicoId);
            }}
            onStatusFilterChange={(status: StatusType | null) => {
              setStatusFilter(status);
            }}
          />
        ) : (
          <ServicoForm
            servico={servicoAtual}
            clientes={clientes}
            onSave={handleSave}
            onCancel={() => {
              setServicoAtual(criarServicoVazio());
              setViewMode("ver");
            }}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}