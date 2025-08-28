'use client';

import { useState } from "react";
import { Card, CardContent } from "@/app/clientes/components/ui/card";
import { Button } from "@/app/clientes/components/ui/button";
import {
  ServicoListProps,
  StatusType,
  Servico,
  STATUS_OPTIONS,
} from "@/app/interfaces/service-interface";
import { Cliente } from "@/app/interfaces/clientes-interface";
import { STATUS_STYLES } from "../utils/service-utils";

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

type Props = ServicoListProps & {
  clientes: Cliente[];
  onView: (servico: Servico) => void;
  onDelete: (id: string) => Promise<void>;
};

export function ServicoList({
  servicos,
  clientes,
  statusFilter,
  onStatusChange,
  onEdit,
  onDelete,
  onView,
  onStatusFilterChange,
}: Props) {
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [servicoToDelete, setServicoToDelete] = useState<string | null>(null);

  const [servicoParaVisualizar, setServicoParaVisualizar] = useState<Servico | null>(null);

  const getClienteNome = (clienteId?: string) => {
    if (!clienteId) return "-";
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente?.nome || "-";
  };

  const filteredServicos = statusFilter
    ? servicos.filter((servico) => servico.status === statusFilter)
    : servicos;

  const handleDeleteClick = (id: string) => {
    setServicoToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!servicoToDelete) return;

    setLoadingDeleteId(servicoToDelete);
    setError(null);

    try {
      await onDelete(servicoToDelete);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir serviço");
    } finally {
      setShowDeleteModal(false);
      setServicoToDelete(null);
      setLoadingDeleteId(null);
    }
  };

  const handleViewClick = (servico: Servico) => {
    setServicoParaVisualizar(servico);
  };

  const closeViewModal = () => {
    setServicoParaVisualizar(null);
  };

  return (
    <div className="space-y-4">
      {/* Filtro de status */}
      <div className="flex justify-between items-center gap-4 mb-4">
        <select
          value={statusFilter || ""}
          onChange={(e) =>
            onStatusFilterChange(
              e.target.value === "" ? null : (e.target.value as StatusType)
            )
          }
          className="w-48 p-2 rounded-md border border-gray-600 bg-[#0f203d] text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Todos os Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-800/80 text-red-100 p-3 rounded-md">{error}</div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] p-6 rounded-lg border border-gray-700 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar exclusão</h3>
            <p className="mb-6">Tem certeza que deseja excluir este serviço?</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={loadingDeleteId !== null}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteConfirm}
                disabled={loadingDeleteId !== null}
              >
                {loadingDeleteId ? "Excluindo..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para visualizar serviço completo */}
      {servicoParaVisualizar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] p-6 rounded-lg border border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Detalhes do Serviço</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Cliente:</strong> {getClienteNome(servicoParaVisualizar.clienteId)}</p>
              <p><strong>Veículo:</strong> {servicoParaVisualizar.veiculo || "-"}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    STATUS_STYLES[servicoParaVisualizar.status]
                  }`}
                >
                  {servicoParaVisualizar.status}
                </span>
              </p>
              <p><strong>Descrição:</strong> {servicoParaVisualizar.descricao}</p>
              {servicoParaVisualizar.observacoes && (
                <p><strong>Observações:</strong> {servicoParaVisualizar.observacoes}</p>
              )}
              <p><strong>Finalizado:</strong> {servicoParaVisualizar.finalizado ? "Sim" : "Não"}</p>
              <p><strong>Prioridade:</strong> {servicoParaVisualizar.prioridade || "-"}</p>
              <p><strong>Valor:</strong> {servicoParaVisualizar.valor ? `R$ ${servicoParaVisualizar.valor}` : "-"}</p>
              <p><strong>Pago:</strong> {servicoParaVisualizar.pago ? "Sim" : "Não"}</p>
              {servicoParaVisualizar.dataCadastro && (
                <p><strong>Data de Cadastro:</strong> {formatDateTime(servicoParaVisualizar.dataCadastro)}</p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={closeViewModal}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de serviços */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServicos.length > 0 ? (
          filteredServicos.map((servico) => (
            <Card key={servico.id} className="bg-[#1e293b] border border-gray-700">
              <CardContent className="p-4 space-y-2 text-sm">
                <p>
                  <strong>Cliente:</strong> {getClienteNome(servico.clienteId)}
                </p>
                <p>
                  <strong>Veículo:</strong> {servico.veiculo || "-"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      STATUS_STYLES[servico.status]
                    }`}
                  >
                    {servico.status}
                  </span>
                </p>
                {servico.dataCadastro && (
                  <p>
                    <strong>Data de Cadastro:</strong> {formatDateTime(servico.dataCadastro)}
                  </p>
                )}
                <p>
                  <strong>Descrição:</strong> {servico.descricao}
                </p>
                {servico.observacoes && (
                  <p>
                    <strong>Observações:</strong> {servico.observacoes}
                  </p>
                )}

                <div className="mt-2">
                  <select
                    value={servico.status}
                    onChange={(e) =>
                      servico.id &&
                      onStatusChange(servico.id, e.target.value as StatusType)
                    }
                    className="w-full p-2 rounded-md border border-gray-600 bg-[#0f203d] text-white text-sm"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewClick(servico)}
                    className="border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition"
                  >
                    Ver
                  </Button>
                  <Button
                    onClick={() => onEdit(servico)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => servico.id && handleDeleteClick(servico.id)}
                    className="border border-red-500 text-white hover:bg-red-500 hover:text-white transition"
                    disabled={loadingDeleteId === servico.id}
                  >
                    {loadingDeleteId === servico.id ? "Excluindo..." : "Deletar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-400">Nenhum serviço encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}