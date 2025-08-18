import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/api/api-requests";
import { Cliente, ViewMode, Veiculo } from "@/app/interfaces/clientes-interface";
import { ApiResponseCliente, ApiResponseDeleteResponse } from "@/app/interfaces/response-interface";
import { criarClienteVazio, normalizarCliente } from "../utils/cliente-utills";

export const useClientes = () => {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>("ver");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteAtual, setClienteAtual] = useState<Cliente>(criarClienteVazio());
  const [clienteVisualizar, setClienteVisualizar] = useState<Cliente | null>(null);
  const [filtro, setFiltro] = useState("");
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const api = useRef(new ApiService()).current;

  // Função para carregar clientes da API e normalizar os dados
  const carregarClientes = async () => {
    try {
      const lista = await api.getClientes();
      setClientes(lista.map(normalizarCliente));
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  // Carrega clientes na montagem do hook
  useEffect(() => {
    carregarClientes();
  }, []);

  // Filtra clientes pelo nome com base no filtro
  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  // Função para preparar veículos antes de enviar para o backend
  const prepararVeiculosParaEnvio = (veiculos: Veiculo[] = []) => {
    return veiculos.map((v) => ({
      ...v,
      placa: v.placa && v.placa.trim() !== "" ? v.placa : "Sem Placa",
    }));
  };

  // Função para salvar cliente (novo ou edição)
  const salvarCliente = async () => {
    if (!clienteAtual.nome.trim()) {
      alert("O nome do cliente é obrigatório.");
      return;
    }

    setLoadingSave(true);

    const clienteParaEnviar: Cliente = {
      ...clienteAtual,
      veiculos: prepararVeiculosParaEnvio(clienteAtual.veiculos),
    };

    try {
      let result: ApiResponseCliente;

      if (viewMode === "cadastrar") {
        result = await api.registerCliente(clienteParaEnviar);
      } else if (viewMode === "editar") {
        if (!clienteAtual.id) {
          alert("ID do cliente inválido para atualização.");
          setLoadingSave(false);
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

        // Recarrega toda a lista após salvar, para garantir estado atualizado
        await carregarClientes();

        setClienteAtual(criarClienteVazio());
        setViewMode("ver");
      } else {
        alert(`Erro: ${result.message || "Não foi possível salvar o cliente."}`);
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao salvar cliente.");
    } finally {
      setLoadingSave(false);
    }
  };

  // Função para deletar cliente
  const deletarCliente = async (id: string) => {
    setLoadingDelete(true);
    try {
      const result: ApiResponseDeleteResponse = await api.deleteCliente(id);
      console.log(result);

      const isSuccess =
        result.status ||
        (result.mensagem && result.mensagem.toLowerCase().includes("sucesso"));

      if (isSuccess) {
        alert(result.mensagem || "Cliente deletado com sucesso!");
        setClientes((prev) => prev.filter((c) => c.id !== id));
        if (clienteVisualizar?.id === id) setClienteVisualizar(null);
        await carregarClientes();
      } else {
        console.error("Erro ao deletar cliente:", result.mensagem || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
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
    loadingSave,
  };
};