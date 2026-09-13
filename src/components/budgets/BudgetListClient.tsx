'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Car,
  Bike,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteBudget } from '@/app/actions/budgets';
import { formatCurrency, formatDate, formatPlate } from '@/lib/utils';
import { BudgetStatus, VehicleType } from '@prisma/client';

interface BudgetItemList {
  id: string;
  code: number;
  date: Date;
  expirationDate: Date;
  status: BudgetStatus;
  totalAmount: any;
  client: {
    id: string;
    name: string;
    phone: string;
  };
  vehicle: {
    id: string;
    brand: string | null;
    model: string | null;
    plate: string | null;
    type: VehicleType;
  };
}



export default function BudgetListClient({
  initialBudgets,
}: {
  initialBudgets: BudgetItemList[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'APROVADO' | 'RECUSADO' | 'EXPIRADO'>(
    'ALL'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetItemList | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Counts
  const openCount = initialBudgets.filter(
    (b) => b.status === 'RASCUNHO' || b.status === 'ENVIADO'
  ).length;
  const approvedCount = initialBudgets.filter((b) => b.status === 'APROVADO').length;
  const rejectedCount = initialBudgets.filter((b) => b.status === 'RECUSADO').length;

  const filtered = initialBudgets.filter((b) => {
  if (activeTab === 'OPEN' && b.status !== 'RASCUNHO' && b.status !== 'ENVIADO') {
    return false;
  }

  if (activeTab !== 'ALL' && activeTab !== 'OPEN' && b.status !== activeTab) {
    return false;
  }

  const term = searchTerm.toLowerCase();

  const codeMatch =
    `#${b.code}`.toLowerCase().includes(term) ||
    b.code.toString().includes(term);

  const clientMatch = b.client.name.toLowerCase().includes(term);

  const vehicleMatch = `${b.vehicle.brand ?? ''} ${b.vehicle.model ?? ''}`
    .toLowerCase()
    .includes(term);

  const plateMatch = (b.vehicle.plate ?? '')
    .toLowerCase()
    .includes(term.replace(/[^a-z0-9]/g, ''));

  return codeMatch || clientMatch || vehicleMatch || plateMatch;
});

  const handleDelete = async () => {
    if (!budgetToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteBudget(budgetToDelete.id);
      if (!res.success) {
        toast.error(res.error || 'Erro ao excluir orçamento.');
      } else {
        toast.success(`Orçamento #${budgetToDelete.code.toString().padStart(4, '0')} excluído.`);
        setBudgetToDelete(null);
        router.refresh();
      }
    } catch {
      toast.error('Erro ao excluir orçamento.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: BudgetStatus) => {
    switch (status) {
      case 'APROVADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Aprovado
          </span>
        );
      case 'ENVIADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3 h-3" /> Enviado
          </span>
        );
      case 'RASCUNHO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Rascunho
          </span>
        );
      case 'RECUSADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" /> Recusado
          </span>
        );
      case 'EXPIRADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Expirado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            <span>Orçamentos</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {filtered.length} {filtered.length === 1 ? 'orçamento' : 'orçamentos'}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestão de propostas comerciais de serviços mecânicos e peças.
          </p>
        </div>

        <Link
          href="/orcamentos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Orçamento</span>
        </Link>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Todos ({initialBudgets.length})
          </button>

          <button
            onClick={() => setActiveTab('OPEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'OPEN'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Em Aberto ({openCount})
          </button>

          <button
            onClick={() => setActiveTab('APROVADO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'APROVADO'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Aprovados ({approvedCount})
          </button>

          <button
            onClick={() => setActiveTab('RECUSADO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'RECUSADO'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Recusados ({rejectedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, veículo ou #código..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Nenhum orçamento encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'Tente pesquisar por outro cliente ou veículo.'
              : 'Clique em "Criar Orçamento" para elaborar uma nova proposta comercial.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Veículo Atendido</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Data & Validade</th>
                  <th className="py-3.5 px-4 text-right">Valor Total</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/orcamentos/${b.id}`}
                        className="font-mono font-bold text-blue-400 hover:underline block"
                      >
                        #{b.code.toString().padStart(4, '0')}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/clientes/${b.client.id}`}
                        className="font-semibold text-white hover:text-blue-400 hover:underline block"
                      >
                        {b.client.name}
                      </Link>
                      <span className="text-[11px] text-slate-500">{b.client.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        {b.vehicle.type === 'CARRO' ? (
                          <Car className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <Bike className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>
                          {b.vehicle.brand} {b.vehicle.model}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        Placa: {formatPlate(b.vehicle.plate)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(b.status)}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-300">Emissão: {formatDate(b.date)}</div>
                      <div className="text-[11px] text-slate-500">
                        Validade: {formatDate(b.expirationDate)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-white">
                      {formatCurrency(Number(b.totalAmount))}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/orcamentos/${b.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                          title="Ver / Imprimir Orçamento"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/orcamentos/${b.id}/editar`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition-colors"
                          title="Editar Orçamento"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setBudgetToDelete(b)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Excluir Orçamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {budgetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Excluir Orçamento</h3>
                <p className="text-xs text-slate-400">Confirmar exclusão de proposta comercial.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja excluir o orçamento{' '}
              <strong className="text-white font-mono">
                #{budgetToDelete.code.toString().padStart(4, '0')}
              </strong>{' '}
              emitido para <strong className="text-white">{budgetToDelete.client.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setBudgetToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Orçamento</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
