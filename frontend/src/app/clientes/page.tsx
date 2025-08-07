'use client';

import { Cliente, Endereco, Veiculo } from "../interfaces/clientes-interface";
import { ClienteForm } from "./components/cliente-form";
import { ClienteList } from "./components/cliente-list";
import { ClienteModal } from "./components/cliente-modal";
import { Button } from "./components/ui/button";
import { useClientes } from "./hook/cliente-hook";
import { criarClienteVazio } from "./utils/cliente-utills";

export default function ClientesPage() {
  const {
    viewMode,
    setViewMode,
    clienteAtual,
    setClienteAtual,
    clienteVisualizar,
    setClienteVisualizar,
    filtro,
    setFiltro,
    salvarCliente,
    deletarCliente,
    clientesFiltrados,
    router,
  } = useClientes();

  const handleChange = <K extends keyof Cliente>(field: K, value: Cliente[K]) => {
    setClienteAtual(prev => ({ ...prev, [field]: value }));
  };

  const handleEnderecoChange = <K extends keyof Endereco>(field: K, value: string) => {
    setClienteAtual(prev => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value }
    }));
  };

  const handleVeiculoChange = <K extends keyof Veiculo>(field: K, value: string, index: number) => {
    setClienteAtual(prev => {
      const novosVeiculos = [...(prev.veiculos ?? [])];
      novosVeiculos[index] = { ...novosVeiculos[index], [field]: value };
      return { ...prev, veiculos: novosVeiculos };
    });
  };

  const addVeiculo = () => {
    setClienteAtual(prev => ({
      ...prev,
      veiculos: [...(prev.veiculos ?? []), { placa: "", modelo: "", ano: "", cor: "", chassi: "" }],
    }));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Botão Voltar (em modo de cadastro/edição) */}
        {viewMode !== "ver" && (
          <div className="mb-6">
            <Button
              variant="outline"
              className="border border-gray-500 text-gray-200 hover:bg-gray-700 
              shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              onClick={() => {
                setClienteAtual(criarClienteVazio());
                setViewMode("ver");
              }}
            >
              ← Voltar
            </Button>
          </div>
        )}

        {/* Lista de clientes */}
        {viewMode === "ver" && (
          <ClienteList
            clientes={clientesFiltrados}
            filtro={filtro}
            setFiltro={setFiltro}
            onAddCliente={() => {
              setClienteAtual(criarClienteVazio());
              setViewMode("cadastrar");
            }}
            onViewCliente={setClienteVisualizar}
            onEditCliente={(cliente) => {
              setClienteAtual(cliente);
              setViewMode("editar");
            }}
            onDeleteCliente={deletarCliente}
            onBackToHome={() => router.push("/")}
          />
        )}

        {/* Formulário de cliente */}
        {(viewMode === "cadastrar" || viewMode === "editar") && (
          <ClienteForm
            cliente={clienteAtual}
            onChange={handleChange}
            onChangeEndereco={handleEnderecoChange}
            onChangeVeiculo={handleVeiculoChange}
            onAddVeiculo={addVeiculo}
            onSalvar={salvarCliente}
            onCancelar={() => {
              setClienteAtual(criarClienteVazio());
              setViewMode("ver");
            }}
            viewMode={viewMode}
          />
        )}

        {/* Modal de visualização */}
        {clienteVisualizar && (
          <ClienteModal
            cliente={clienteVisualizar}
            onFechar={() => setClienteVisualizar(null)}
          />
        )}
      </div>
    </div>
  );
}