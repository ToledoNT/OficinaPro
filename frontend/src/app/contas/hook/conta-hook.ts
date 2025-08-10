import { useState, useEffect } from "react";
import { Cliente } from "@/app/interfaces/clientes-interface";
import { Servico } from "@/app/interfaces/service-interface";
import { ApiService } from "@/api/api-requests";

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
      } finally {
        setLoading(false);
      }
    }

    fetchClientes();
  }, []);

  return { clientes, loading, error };
}

export function useServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServicos() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getServicos();
        setServicos(data);
      } catch (e) {
        setError("Erro ao buscar serviços.");
      } finally {
        setLoading(false);
      }
    }

    fetchServicos();
  }, []);

  return { servicos, loading, error };
}
