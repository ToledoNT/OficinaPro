import { useState, useEffect } from "react";
import { Cliente } from "@/app/interfaces/clientes-interface";
import { Servico } from "@/app/interfaces/service-interface";
import { ApiService } from "@/api/api-requests";
import { Conta, IRegisterContaData } from "@/app/interfaces/contas-interface";

const api = new ApiService();

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClientes() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getClientes();
        setClientes(data);
      } catch (e) {
        setError("Erro ao buscar clientes.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchClientes();
  }, []);

  return { clientes, loading, error };
}

// Busca serviços pelo clienteId — clienteId pode ser string ou number
export function useServicosPorCliente(clienteId?: string | number) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clienteId === undefined || clienteId === null) {
      setServicos([]);
      return;
    }

    async function fetchServicos() {
      setLoading(true);
      setError(null);

      try {
        const idStr = typeof clienteId === "number" ? clienteId.toString() : clienteId;

        if (!idStr) {
          setError("ID do cliente inválido.");
          setServicos([]);
          setLoading(false);
          return;
        }

        const data = await api.getServicosPorCliente(idStr);
        setServicos(data);
      } catch (e) {
        setError("Erro ao buscar serviços do cliente.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchServicos();
  }, [clienteId]);

  return { servicos, loading, error };
}

export function useContas() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContas() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getContas();
        setContas(data);
      } catch (e) {
        setError("Erro ao buscar contas.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchContas();
  }, []);

  async function salvarConta(conta: Conta) {
    try {
      if (!conta.descricao.trim()) throw new Error("Descrição é obrigatória");
      if (!conta.clienteId) throw new Error("Cliente é obrigatório");

      const contaParaSalvar: IRegisterContaData = {
        ...conta,
        clienteId: Number(conta.clienteId),
      };

      let result;
      if (conta.id === undefined) {
        result = await api.registerConta(contaParaSalvar);
      } else {
        result = await api.updateConta(conta.id, contaParaSalvar);
      }

      if (result.status) {
        const updated = await api.getContas();
        setContas(updated);
        return { success: true };
      } else {
        return { success: false, message: result.message || "Erro ao salvar conta." };
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        return { success: false, message: err.message || "Erro ao salvar conta." };
      }
      return { success: false, message: "Erro desconhecido." };
    }
  }

  async function deletarConta(id: number) {
    try {
      const result = await api.deleteConta(id);
      if (result.status) {
        setContas((prev) => prev.filter((c) => c.id !== id));
        return { success: true };
      } else {
        return { success: false, message: "Erro ao deletar conta." };
      }
    } catch (e) {
      console.error(e);
      return { success: false, message: "Erro ao deletar conta." };
    }
  }

  return {
    contas,
    loading,
    error,
    salvarConta,
    deletarConta,
  };
}
