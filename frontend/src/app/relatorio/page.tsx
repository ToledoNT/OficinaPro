'use client';

import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

interface RelatorioItem {
  id: number;
  cliente: string;
  servico: string;
  data: string;
  valor: number;
  pago: boolean;
}

export default function Relatorios() {
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroPago, setFiltroPago] = useState<'todos' | 'sim' | 'nao'>('todos');

  // Dados fictícios para exemplo
  const relatoriosData: RelatorioItem[] = [
    { id: 1, cliente: 'João Silva', servico: 'Troca de óleo', data: '2025-07-01', valor: 150, pago: true },
    { id: 2, cliente: 'Maria Souza', servico: 'Revisão geral', data: '2025-07-10', valor: 300, pago: false },
    { id: 3, cliente: 'Carlos Pereira', servico: 'Conserto freios', data: '2025-07-15', valor: 200, pago: true },
  ];

  // Filtra dados pelo cliente e status pagamento
  const relatoriosFiltrados = relatoriosData.filter(item => {
    const clienteMatch = item.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
    const pagoMatch = filtroPago === 'todos' || (filtroPago === 'sim' ? item.pago : !item.pago);
    return clienteMatch && pagoMatch;
  });

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-white p-6">
      {/* Container centralizado com largura máxima */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-cyan-400 text-center">Relatórios</h1>

        <Card>
          <CardContent className="space-y-6">
            {/* Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">Filtrar por Cliente</Label>
                <Input
                  placeholder="Nome do cliente"
                  value={filtroCliente}
                  onChange={e => setFiltroCliente(e.target.value)}
                  className="bg-[#162a46] border border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label className="text-gray-300">Status do Pagamento</Label>
                <select
                  className="w-full bg-[#162a46] border border-gray-600 text-white p-2 rounded-md"
                  value={filtroPago}
                  onChange={e => setFiltroPago(e.target.value as 'todos' | 'sim' | 'nao')}
                >
                  <option value="todos">Todos</option>
                  <option value="sim">Pagos</option>
                  <option value="nao">Não pagos</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFiltroCliente('');
                    setFiltroPago('todos');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Limpar filtros
                </Button>
              </div>
            </div>

            {/* Tabela responsiva */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-600">
                <thead className="hidden sm:table-header-group bg-[#1a2333]">
                  <tr>
                    <th className="border border-gray-600 px-4 py-2 text-left">Cliente</th>
                    <th className="border border-gray-600 px-4 py-2 text-left">Serviço</th>
                    <th className="border border-gray-600 px-4 py-2 text-left">Data</th>
                    <th className="border border-gray-600 px-4 py-2 text-left">Valor (R$)</th>
                    <th className="border border-gray-600 px-4 py-2 text-left">Pago</th>
                  </tr>
                </thead>
                <tbody className="sm:table-row-group">
                  {relatoriosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400">
                        Nenhum relatório encontrado.
                      </td>
                    </tr>
                  )}
                  {relatoriosFiltrados.map(({ id, cliente, servico, data, valor, pago }) => (
                    <tr
                      key={id}
                      className="border border-gray-600 mb-4 block sm:table-row even:bg-[#162a46] odd:bg-[#1a2333] rounded-lg sm:rounded-none"
                    >
                      <td
                        className="block sm:table-cell border border-gray-600 px-4 py-2"
                        data-label="Cliente"
                      >
                        <span className="font-semibold sm:hidden">Cliente: </span>{cliente}
                      </td>
                      <td
                        className="block sm:table-cell border border-gray-600 px-4 py-2"
                        data-label="Serviço"
                      >
                        <span className="font-semibold sm:hidden">Serviço: </span>{servico}
                      </td>
                      <td
                        className="block sm:table-cell border border-gray-600 px-4 py-2"
                        data-label="Data"
                      >
                        <span className="font-semibold sm:hidden">Data: </span>{data}
                      </td>
                      <td
                        className="block sm:table-cell border border-gray-600 px-4 py-2"
                        data-label="Valor"
                      >
                        <span className="font-semibold sm:hidden">Valor: </span>{valor.toFixed(2)}
                      </td>
                      <td
                        className="block sm:table-cell border border-gray-600 px-4 py-2"
                        data-label="Pago"
                      >
                        <span className="font-semibold sm:hidden">Pago: </span>
                        {pago ? (
                          <span className="text-green-400 font-semibold">Sim</span>
                        ) : (
                          <span className="text-red-500 font-semibold">Não</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
