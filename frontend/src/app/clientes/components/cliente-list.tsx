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
}: ClienteListProps) => {
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    if (!id) {
      console.error('ID inválido recebido:', id);
      setError("ID do cliente inválido");
      return;
    }
    
    setClienteToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clienteToDelete) return;
    
    console.log('[1] Iniciando exclusão para ID:', clienteToDelete);
    setLoadingDeleteId(clienteToDelete);
    setError(null);

    try {
      console.log('[2] Chamando API para ID:', clienteToDelete);
      await onDeleteCliente(clienteToDelete);
      console.log('[3] Exclusão concluída com sucesso');
    } catch (err) {
      console.error('[ERRO] Falha na exclusão:', err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir cliente";
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
    console.log('Exclusão cancelada pelo usuário');
  };

  return (
    <div className="space-y-6 p-4">
      {/* Barra de ações */}
      <div className="flex flex-wrap gap-4">
        <Button className="bg-blue-600 hover:bg-blue-700 shadow">
          Ver Clientes
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
          ← Voltar
        </Button>
      </div>

      {/* Campo de busca */}
      <Input
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Buscar cliente por nome..."
        className="bg-[#1e293b] border-gray-600 text-white max-w-md"
      />

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

      {/* Lista de clientes */}
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
    </div>
  );
};