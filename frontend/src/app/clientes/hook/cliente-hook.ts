import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/api/api-requests";
import { Cliente, ViewMode } from "@/app/interfaces/clientes-interface";
import { ApiResponseCliente } from "@/app/interfaces/response-interface";
import { criarClienteVazio, filtrarVeiculosVazios, normalizarCliente } from "../utils/cliente-utills";

export const useClientes = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("ver");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteAtual, setClienteAtual] = useState<Cliente>(criarClienteVazio());
  const [clienteVisualizar, setClienteVisualizar] = useState<Cliente | null>(null);
  const [filtro, setFiltro] = useState("");

  const api = new ApiService(); // cria só uma vez

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
  }, []);

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
            : prev.map((c) => (c.id === result.data!.id ? normalizarCliente(result.data!) : c))
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

  const deletarCliente = async (id: string) => {
    if (!confirm("Deseja realmente deletar este cliente?")) return;

    try {
      const result = await api.deleteCliente(id);

      if (result.status) {
        setClientes((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(`Erro ao deletar cliente: ${result.message || "Erro desconhecido."}`);
      }
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      alert("Erro ao deletar cliente.");
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

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
  };
};