"use client";

import { Card, CardContent } from "@/app/clientes/components/ui/card";
import {
  ServicoListProps,
  STATUS_OPTIONS,
  StatusType,
  Servico,
} from "@/app/interfaces/service-interface";
import { STATUS_STYLES } from "../utils/service-utils";
import { Button } from "@/app/clientes/components/ui/button";
import { useState } from "react";

export function ServicoList({
  servicos,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
}: ServicoListProps & {
  onView: (servico: Servico) => void;
  onDelete: (id: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<StatusType | "">(""); // Estado para filtrar pelo status

  const handleStatusChange = (id: string, newStatus: string) => {
    if (STATUS_OPTIONS.includes(newStatus as StatusType)) {
      onStatusChange(id, newStatus as StatusType);
    }
  };

  // Filtro de serviços pelo status (fora do lookup)
  const filteredServicos = statusFilter
    ? servicos.filter((servico) => servico.status === statusFilter)
    : servicos;

  return (
    <div className="space-y-4">
      {/* Filtro de Status - Fora do lookup */}
      <div className="flex justify-between items-center gap-4 mb-4">
        <div className="flex-1">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusType)}
            className="w-40 p-1 rounded-md border border-gray-600 bg-[#0f203d] text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Filtrar por Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Serviços Filtrados */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServicos.length > 0 ? (
          filteredServicos.map((servico) => (
            <Card
              key={servico.id}
              className="bg-[#1e293b] border border-gray-700"
            >
              <CardContent className="p-4 space-y-2 text-sm">
                <div>
                  <p><strong>Cliente:</strong> {servico.cliente || "-"}</p>
                  <p><strong>Veículo:</strong> {servico.veiculo || "-"}</p>
                  <p className="flex items-center">
                    <strong>Status:</strong>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[servico.status]}`}
                    >
                      {servico.status}
                    </span>
                  </p>
                </div>

                <p><strong>Descrição:</strong> {servico.descricao}</p>

                {servico.observacoes && (
                  <p><strong>Observações:</strong> {servico.observacoes}</p>
                )}

                <div className="mt-2">
                  <select
                    value={servico.status}
                    onChange={(e) =>
                      servico.id && handleStatusChange(servico.id, e.target.value)
                    }
                    className="w-full p-2 rounded-md border border-gray-600 bg-[#0f203d] text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botões com estilos solicitados */}
                <div className="mt-4 flex justify-end gap-2">
                  {/* Ver - Borda amarela, texto amarelo; hover fundo amarelo e texto branco */}
                  <Button
                    variant="outline"
                    onClick={() => onView(servico)}
                    className="border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition px-3 py-1 text-sm"
                  >
                    Ver
                  </Button>

                  {/* Editar - Azul sólido */}
                  <Button
                    onClick={() => onEdit(servico)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
                  >
                    Editar
                  </Button>

                  {/* Deletar - Borda vermelha e texto branco */}
                  <Button
                    variant="outline"
                    onClick={() => servico.id && onDelete(servico.id)}
                    className="border border-red-500 text-white hover:bg-red-500 hover:text-white transition px-3 py-1 text-sm"
                  >
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-400">Nenhum serviço encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}