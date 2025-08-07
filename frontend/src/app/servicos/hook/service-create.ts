'use client';

import { useState, useEffect, useMemo } from "react";
import { ApiService } from "@/api/api-requests";
import { Cliente } from "@/app/interfaces/clientes-interface";
import {
  createEmptyService,
  IRegisterServiceData,
  IUpdateServiceData,
  Servico,
  StatusType,
} from "@/app/interfaces/service-interface";

export const useServicos = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoAtual, setServicoAtual] = useState<Servico>(createEmptyService());
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"ver" | "cadastrar">("ver");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const api = new ApiService();
        const listaClientes: Cliente[] = await api.getClientes();
        const listaServicos: Servico[] = await api.getServicos();

        setClientes(listaClientes);
        setServicos(listaServicos);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  const servicosFiltrados = useMemo(() => {
    const busca = filtro.toLowerCase();
    return servicos.filter((servico) => {
      const cliente = servico.cliente?.toLowerCase() || "";
      const descricao = servico.descricao?.toLowerCase() || "";
      const matchesSearch = cliente.includes(busca) || descricao.includes(busca);
      const matchesStatus = statusFilter ? servico.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [servicos, filtro, statusFilter]);

  const salvarServico = async (servico: Servico): Promise<boolean> => {
    setLoading(true);
    try {
      const api = new ApiService();
      let response;

      if (servico.id) {
        response = await api.updateService(servico as IUpdateServiceData);

        if (response.status) {
          setServicos((prev) =>
            prev.map((s) => (s.id === servico.id ? { ...s, ...servico } : s))
          );
          return true;
        }
      } else {
        // Se tiver implementação de criação, você pode adicionar aqui.
      }

      return false;
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (
    id: string,
    status: StatusType
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const api = new ApiService();
      const response = await api.updateService({ id, status });

      if (response.status) {
        setServicos((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s))
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletarServico = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const api = new ApiService();
      const response = await api.deleteService(id); // Assumindo que deleteService exista na API

      if (response.status) {
        setServicos((prev) => prev.filter((s) => s.id !== id));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao deletar serviço:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    viewMode,
    setViewMode,
    servicos,
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
    criarServicoVazio: createEmptyService,
  };
};