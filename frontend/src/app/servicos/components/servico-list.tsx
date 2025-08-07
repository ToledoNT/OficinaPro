'use client';

import { Card, CardContent } from "@/app/clientes/components/ui/card";
import {ServicoListProps, STATUS_OPTIONS, StatusType } from "@/app/interfaces/service-interface";
import { STATUS_STYLES } from "../utils/service-utils";
import { Button } from "@/app/clientes/components/ui/button";

export function ServicoList({
  servicos,
  onEdit,
  onStatusChange
}: ServicoListProps) {
  const handleStatusChange = (id: string, newStatus: string) => {
    // Garante que o status é um dos tipos válidos
    if (STATUS_OPTIONS.includes(newStatus as StatusType)) {
      onStatusChange(id, newStatus as StatusType);
    }
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {servicos.length > 0 ? (
        servicos.map((servico) => (
          <Card key={servico.id} className="bg-[#1e293b] border border-gray-700">
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p><strong>Cliente:</strong> {servico.cliente || "-"}</p>
                  <p><strong>Veículo:</strong> {servico.veiculo || "-"}</p>
                  <p className="flex items-center">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      STATUS_STYLES[servico.status]
                    }`}>
                      {servico.status}
                    </span>
                  </p>
                </div>
              </div>

              <p><strong>Descrição:</strong> {servico.descricao}</p>

              {servico.observacoes && (
                <p><strong>Observações:</strong> {servico.observacoes}</p>
              )}

              <div className="mt-2">
                <select
                  value={servico.status}
                  onChange={(e) => servico.id && handleStatusChange(servico.id, e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-[#0f203d] text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => onEdit(servico)}
                  className="hover:bg-blue-600 hover:text-white"
                >
                  Editar
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
  );
}