import { Cliente } from "@/app/interfaces/clientes-interface";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ClienteCard } from "./cliente-card";
import { useState } from "react";

interface ClienteListProps {
  clientes: Cliente[];
  filtro: string;
  setFiltro: (value: string) => void;
  onAddCliente: () => void;
  onViewCliente: (cliente: Cliente) => void;
  onEditCliente: (cliente: Cliente) => void;
  onDeleteCliente: (id: string) => Promise<void>;
  onBackToHome: () => void;
  fetchClientes?: () => Promise<void>; // função opcional para buscar clientes
}

export const ClienteList = ({
  clientes,
  filtro,
  setFiltro,
  onAddCliente,
  onViewCliente,
  onEditCliente,
  onDeleteCliente,
  onBackToHome,
  fetchClientes,
}: ClienteListProps) => {
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);
  const [mostrarClientes, setMostrarClientes] = useState(false);

  const handleDeleteClick = (id: string) => {
    if (!id) {
      setError("ID do cliente inválido");
      return;
    }
    setClienteToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clienteToDelete) return;
    setLoadingDeleteId(clienteToDelete);
    setError(null);

    try {
      await onDeleteCliente(clienteToDelete);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao excluir cliente";
      setError(errorMessage);
    } finally {
      setLoadingDeleteId(null);
      setShowDeleteModal(false);
      setClienteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setClienteToDelete(null);
  };

  const handleVerClientes = async () => {
    setLoadingClientes(true);
    setMostrarClientes(true);

    try {
      if (fetchClientes) {
        await fetchClientes(); // busca os clientes antes de remover o loading
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar clientes";
      setError(errorMessage);
    } finally {
      setLoadingClientes(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Barra de ações */}
      <div className="flex flex-wrap gap-4">
        <Button
          className="bg-blue-600 hover:bg-blue-700 shadow flex items-center justify-center"
          onClick={handleVerClientes}
          disabled={loadingClientes}
        >
          {loadingClientes ? (
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>Carregando...</span>
            </div>
          ) : (
            "Ver Clientes"
          )}
        </Button>

        <Button
          className="bg-green-600 hover:bg-green-700 shadow"
          onClick={onAddCliente}
        >
          Cadastrar Cliente
        </Button>

        <Button
          variant="outline"
          onClick={onBackToHome}
          className="hover:bg-gray-700"
        >
          ← Voltar para tela inicial
        </Button>
      </div>

      {/* Campo de busca */}
      {mostrarClientes && (
        <Input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar cliente por nome..."
          className="bg-[#1e293b] border-gray-600 text-white max-w-md"
        />
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-900/80 text-red-100 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Modal de confirmação */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] p-6 rounded-lg border border-gray-700 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar exclusão</h3>
            <p className="mb-6">Tem certeza que deseja excluir este cliente?</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={loadingDeleteId !== null}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 flex items-center justify-center"
                onClick={handleDeleteConfirm}
                disabled={loadingDeleteId !== null}
              >
                {loadingDeleteId ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span>Excluindo...</span>
                  </div>
                ) : (
                  "Confirmar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de clientes */}
      {mostrarClientes && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center py-8">
              Nenhum cliente encontrado
            </p>
          ) : (
            clientes.map((cliente) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                onView={() => onViewCliente(cliente)}
                onEdit={() => onEditCliente(cliente)}
                onDelete={() => handleDeleteClick(cliente.id)}
                loading={loadingDeleteId === cliente.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
