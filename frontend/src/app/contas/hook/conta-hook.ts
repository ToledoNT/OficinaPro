import { useState } from "react";
import { Cliente } from "@/app/interfaces/clientes-interface";
import { Servico } from "@/app/interfaces/service-interface";
import { ApiService } from "@/app/api/api-requests";
import { ApiResponseDeleteConta, Conta, IRegisterContaData } from "@/app/interfaces/contas-interface";

const api = new ApiService();

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);

  const fetchClientes = async () => {
    setLoadingClientes(true);
    setErrorClientes(null);
    try {
      const data = await api.getClientes();
      setClientes(data);
      return data;
    } catch (e) {
      console.error(e);
      setErrorClientes("Erro ao buscar clientes.");
      return [];
    } finally {
      setLoadingClientes(false);
    }
  };

  return { clientes, loadingClientes, errorClientes, fetchClientes };
}

export function useServicosPorCliente() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServicos = async (clienteId: string) => {
    setLoading(true);
    setError(null);
    try {
      const dados = await api.getServicosPorCliente(clienteId);
      setServicos(dados);
    } catch (err) {
      setError('Erro ao carregar serviços');
      setServicos([]);
    } finally {
      setLoading(false);
    }
  };

  return { servicos, loading, error, fetchServicos };
}

export function useContas() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loadingContas, setLoadingContas] = useState(false);
  const [errorContas, setErrorContas] = useState<string | null>(null);

  const fetchContas = async () => {
    setLoadingContas(true);
    setErrorContas(null);
    try {
      const data = await api.getContas();
      setContas(data);
      return { success: true, data };
    } catch (e) {
      console.error(e);
      setErrorContas("Erro ao buscar contas.");
      return { success: false, error: e };
    } finally {
      setLoadingContas(false);
    }
  };

  const salvarConta = async (conta: Conta) => {
    try {
      if (!conta.descricao.trim()) throw new Error("Descrição é obrigatória");
      if (!conta.clienteId) throw new Error("Cliente é obrigatório");

      const contaParaSalvar: IRegisterContaData = {
        ...conta,
        clienteId: String(conta.clienteId),
      };

      let result;
      if (conta.id === undefined) {
        result = await api.registerConta(contaParaSalvar);
      } else {
        result = await api.updateConta(conta.id, contaParaSalvar);
      }

      if (result.status) {
        await fetchContas();
        return { success: true };
      }
      return { success: false, message: result.message || "Erro ao salvar conta." };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido.";
      return { success: false, message };
    }
  };

  const deletarConta = async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const result: ApiResponseDeleteConta = await api.deleteConta(id);
  
      if (result.dados.status) {
        setContas(prev => prev.filter(c => c.id !== id));
        return { success: true, message: result.dados.message };
      }
  
      return { success: false, message: result.dados.message || "Erro ao deletar conta." };
    } catch (e) {
      console.error("Erro ao deletar conta:", e);
      return { success: false, message: "Erro ao deletar conta." };
    }
  };
    return {
    contas,
    loadingContas,
    errorContas,
    fetchContas,
    salvarConta,
    deletarConta,
  };
}