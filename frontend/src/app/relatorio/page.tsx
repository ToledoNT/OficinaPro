'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../clientes/components/ui/input';
import { Label } from '../clientes/components/ui/label';
import { Button } from '../clientes/components/ui/button';
import { Card, CardContent } from '../clientes/components/ui/card';
import { RelatorioItem } from '../interfaces/relatorio-interface';
import { ApiService } from '@/app/api/api-requests';

export default function Relatorios() {
  const router = useRouter();
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroPago, setFiltroPago] = useState<'todos' | 'sim' | 'nao'>('todos');
  const [relatoriosData, setRelatoriosData] = useState<RelatorioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const api = new ApiService();

  useEffect(() => {
    const fetchRelatorios = async () => {
      setLoading(true);
      try {
        const [clientes, contas, servicos] = await Promise.all([
          api.getClientes(),
          api.getContas(),
          api.getServicos(),
        ]);

        const relatorios: RelatorioItem[] = contas
          .filter(conta => conta.id !== undefined)
          .map(conta => {
            const cliente = clientes.find(c => c.id === conta.clienteId);
            const servico = servicos.find(s => s.id === conta.servicoId);

            return {
              id: Number(conta.id),
              cliente: cliente?.nome || conta.clienteNome || 'Cliente não encontrado',
              servico: servico?.descricao || conta.servicoVinculado || 'Serviço não definido',
              data: conta.dataPagamento || new Date().toISOString(),
              valor: Number(conta.valor) || 0,
              pago: Boolean(conta.pago),
            };
          });

        setRelatoriosData(relatorios);
      } catch (error) {
        console.error('Erro ao buscar relatórios:', error);
        setRelatoriosData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorios();
  }, []);

  const relatoriosFiltrados = useMemo(() => {
    return relatoriosData.filter(item => {
      const clienteMatch = item.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
      const pagoMatch =
        filtroPago === 'todos' ? true : filtroPago === 'sim' ? item.pago : !item.pago;
      return clienteMatch && pagoMatch;
    });
  }, [filtroCliente, filtroPago, relatoriosData]);

  const totalGeral = relatoriosFiltrados.reduce((acc, item) => acc + item.valor, 0);
  const totalPago = relatoriosFiltrados
    .filter(item => item.pago)
    .reduce((acc, item) => acc + item.valor, 0);

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Botão voltar */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="border border-gray-500 text-gray-200 hover:bg-gray-700"
          >
              ← Voltar para tela inicial
              </Button>
        </div>

        {/* Título com separador */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">📊 Relatórios</h1>
          <div className="h-1 w-24 bg-cyan-400 mx-auto rounded-full"></div>
        </div>

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

            {/* Loading animado */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400 border-b-4 border-gray-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-600 min-w-[600px]">
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
                        className="border border-gray-600 mb-4 block sm:table-row even:bg-[#162a46] odd:bg-[#1a2333] rounded-lg sm:rounded-none hover:bg-cyan-700 transition-colors"
                      >
                        <td className="block sm:table-cell border border-gray-600 px-4 py-2" data-label="Cliente">
                          <span className="font-semibold sm:hidden">Cliente: </span>{cliente}
                        </td>
                        <td className="block sm:table-cell border border-gray-600 px-4 py-2" data-label="Serviço">
                          <span className="font-semibold sm:hidden">Serviço: </span>{servico}
                        </td>
                        <td className="block sm:table-cell border border-gray-600 px-4 py-2" data-label="Data">
                          <span className="font-semibold sm:hidden">Data: </span>{new Date(data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="block sm:table-cell border border-gray-600 px-4 py-2" data-label="Valor">
                          <span className="font-semibold sm:hidden">Valor: </span>{valor.toFixed(2)}
                        </td>
                        <td className="block sm:table-cell border border-gray-600 px-4 py-2" data-label="Pago">
                          <span className="font-semibold sm:hidden">Pago: </span>
                          {pago ? (
                            <span className="text-green-400 font-semibold">Sim</span>
                          ) : (
                            <span className="text-red-500 font-semibold">Não</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {relatoriosFiltrados.length > 0 && (
                      <tr className="bg-[#1a2333] font-semibold">
                        <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                        <td className="px-4 py-2">{totalGeral.toFixed(2)}</td>
                        <td className="px-4 py-2">{totalPago.toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}