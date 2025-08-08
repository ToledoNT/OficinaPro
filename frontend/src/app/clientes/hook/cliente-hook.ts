import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/api/api-requests";
import { Cliente, ViewMode } from "@/app/interfaces/clientes-interface";
import { ApiResponseCliente } from "@/app/interfaces/response-interface";
import { criarClienteVazio, filtrarVeiculosVazios, normalizarCliente } from "../utils/cliente-utills";

export const useClientes = () => {
  const router = useRouter();

  // Estados principais
  const [viewMode, setViewMode] = useState<ViewMode>("ver");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteAtual, setClienteAtual] = useState<Cliente>(criarClienteVazio());
  const [clienteVisualizar, setClienteVisualizar] = useState<Cliente | null>(null);
  const [filtro, setFiltro] = useState("");
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Instância estável da API (não muda entre renders)
  const api = useRef(new ApiService()).current;

  // Carregar clientes uma única vez ao montar o hook
  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const lista = await api.getClientes();
        setClientes(lista.map(normalizarCliente));
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    };
    carregarClientes();
  }, []); // vazio, pois api é estável

  // Clientes filtrados pelo filtro de nome (sempre atualizado)
  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  // Função para salvar cliente (cadastrar ou editar)
  const salvarCliente = async () => {
    if (!clienteAtual.nome.trim()) {
      alert("O nome do cliente é obrigatório.");
      return;
    }

    const clienteParaEnviar = {
      ...clienteAtual,
      veiculos: filtrarVeiculosVazios(clienteAtual.veiculos),
    };

    try {
      let result: ApiResponseCliente;

      if (viewMode === "cadastrar") {
        result = await api.registerCliente(clienteParaEnviar);
      } else if (viewMode === "editar") {
        if (!clienteAtual.id) {
          alert("ID do cliente inválido para atualização.");
          return;
        }
        result = await api.updateCliente(clienteAtual.id, clienteParaEnviar);
      } else {
        throw new Error("Modo inválido");
      }

      if (result.status && result.data) {
        alert(
          viewMode === "cadastrar"
            ? "Cliente registrado com sucesso!"
            : "Cliente atualizado com sucesso!"
        );

        setClientes((prev) =>
          viewMode === "cadastrar"
            ? [...prev, normalizarCliente(result.data!)]
            : prev.map((c) =>
                c.id === result.data!.id ? normalizarCliente(result.data!) : c
              )
        );

        setClienteAtual(criarClienteVazio());
        setViewMode("ver");
      } else {
        alert(`Erro: ${result.message || "Não foi possível salvar o cliente."}`);
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao salvar cliente.");
    }
  };

  // Função para deletar cliente
  const deletarCliente = async (id: string) => {
    console.log("deletarCliente chamado com id:", id);
    setLoadingDelete(true);
    try {
      const result = await api.deleteCliente(id);
      console.log("Resultado da API deleteCliente:", result);

      if (result.status) {
        setClientes((prev) => prev.filter((c) => c.id !== id));
        alert("Cliente deletado com sucesso!");
        if (clienteVisualizar?.id === id) setClienteVisualizar(null);
      } else {
        alert(`Erro ao deletar cliente: ${result.message || "Erro desconhecido."}`);
      }
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      alert("Erro ao deletar cliente.");
    } finally {
      setLoadingDelete(false);
    }
  };

  return {
    viewMode,
    setViewMode,
    clientes,
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
    loadingDelete,
  };
};
