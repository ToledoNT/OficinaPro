'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Plus,
  Search,
  Eye,
  Trash2,
  Car,
  Bike,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Pause,
  AlertTriangle,
  Loader2,
  Wrench,
  Calendar,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteWorkOrder } from '@/app/actions/workOrders';
import { formatDate, formatKm, formatCurrency, formatPlate } from '@/lib/utils';
import { WorkOrderStatus, VehicleType } from '@prisma/client';

interface WorkOrderItem {
  id: string;
  code: number;
  status: WorkOrderStatus;
  problemReported: string;
  mileageIn: number;
  totalAmount: any;
  estimatedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  responsibleName: string | null;
  createdAt: Date;
  client: { id: string; name: string; phone: string };
  vehicle: {
    id: string;
    brand: string | null;
    model: string | null;
    plate: string | null;
    type: VehicleType;
  };
}

const statusConfig: Record<
  WorkOrderStatus,
  { label: string; icon: React.ElementType; colorClass: string; bgClass: string }
> = {
  AGUARDANDO: {
    label: 'Aguardando',
    icon: Clock,
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
  },
  EM_EXECUCAO: {
    label: 'Em Execução',
    icon: Play,
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10 border-blue-500/20',
  },
  PAUSADO: {
    label: 'Pausado',
    icon: Pause,
    colorClass: 'text-slate-400',
    bgClass: 'bg-slate-500/10 border-slate-500/20',
  },
  CONCLUIDO: {
    label: 'Concluído',
    icon: CheckCircle2,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
  },
  CANCELADO: {
    label: 'Cancelado',
    icon: XCircle,
    colorClass: 'text-red-400',
    bgClass: 'bg-red-500/10 border-red-500/20',
  },
};

export default function WorkOrderListClient({
  initialWorkOrders,
}: {
  initialWorkOrders: WorkOrderItem[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'AGUARDANDO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO'
  >('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderToDelete, setOrderToDelete] = useState<WorkOrderItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeCount = initialWorkOrders.filter(
    (o) => o.status === 'AGUARDANDO' || o.status === 'EM_EXECUCAO' || o.status === 'PAUSADO'
  ).length;
  const doneCount = initialWorkOrders.filter((o) => o.status === 'CONCLUIDO').length;

  const filtered = initialWorkOrders.filter((o) => {
    if (activeTab !== 'ALL' && o.status !== activeTab) return false;

    const term = searchTerm.toLowerCase();
    const codeMatch = `#${o.code}`.includes(term) || o.code.toString().includes(term);
    const clientMatch = o.client.name.toLowerCase().includes(term);
    const vehicleMatch = `${o.vehicle.brand ?? ''} ${o.vehicle.model ?? ''}`.toLowerCase().includes(term);
    const plateMatch = (o.vehicle.plate ?? '').toLowerCase().includes(term.replace(/[^a-z0-9]/g, ''));
    return codeMatch || clientMatch || vehicleMatch || plateMatch;
  });

  const handleDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteWorkOrder(orderToDelete.id);
      if (!res.success) {
        toast.error(res.error || 'Erro ao excluir O.S.');
      } else {
        toast.success(`O.S. #${String(orderToDelete.code).padStart(4, '0')} excluída.`);
        setOrderToDelete(null);
        router.refresh();
      }
    } catch {
      toast.error('Ocorreu um erro ao excluir a Ordem de Serviço.');
    } finally {
      setIsDeleting(false);
    }
  };

  const StatusBadge = ({ status }: { status: WorkOrderStatus }) => {
    const cfg = statusConfig[status];
    const Icon = cfg.icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bgClass} ${cfg.colorClass}`}
      >
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };

  const tabs = [
    { key: 'ALL', label: 'Todas', count: initialWorkOrders.length },
    { key: 'AGUARDANDO', label: 'Aguardando', count: initialWorkOrders.filter((o) => o.status === 'AGUARDANDO').length },
    { key: 'EM_EXECUCAO', label: 'Em Execução', count: initialWorkOrders.filter((o) => o.status === 'EM_EXECUCAO').length },
    { key: 'CONCLUIDO', label: 'Concluídas', count: doneCount },
    { key: 'CANCELADO', label: 'Canceladas', count: initialWorkOrders.filter((o) => o.status === 'CANCELADO').length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-400" />
            <span>Ordens de Serviço</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {activeCount} ativa{activeCount !== 1 ? 's' : ''}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Controle e acompanhamento de serviços em andamento na oficina.
          </p>
        </div>
        <Link
          href="/ordens-de-servico/nova"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova O.S.</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-0.5 cursor-pointer ${
              activeTab === tab.key
                ? 'text-blue-400 border-blue-500 bg-blue-500/5'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, cliente, veículo ou placa..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
          >
            Limpar busca
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">
            {searchTerm ? 'Nenhuma O.S. encontrada' : 'Nenhuma Ordem de Serviço ainda'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'Tente ajustar os termos da busca.'
              : 'Crie uma nova Ordem de Serviço ou aprove um orçamento para gerar uma automaticamente.'}
          </p>
          {!searchTerm && (
            <Link
              href="/ordens-de-servico/nova"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Primeira O.S.</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-4">O.S. / Status</th>
                  <th className="py-3.5 px-4">Cliente & Veículo</th>
                  <th className="py-3.5 px-4">Problema Relatado</th>
                  <th className="py-3.5 px-4">Responsável</th>
                  <th className="py-3.5 px-4">Previsão</th>
                  <th className="py-3.5 px-4 text-right">Valor</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1.5">
                        <Link
                          href={`/ordens-de-servico/${order.id}`}
                          className="font-mono font-bold text-blue-400 hover:underline text-sm"
                        >
                          #{String(order.code).padStart(4, '0')}
                        </Link>
                        <StatusBadge status={order.status} />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/clientes/${order.client.id}`}
                        className="font-semibold text-white hover:text-blue-400 hover:underline"
                      >
                        {order.client.name}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                        {order.vehicle.type === 'CARRO' ? (
                          <Car className="w-3 h-3 text-blue-400" />
                        ) : (
                          <Bike className="w-3 h-3 text-emerald-400" />
                        )}
                        <Link
                          href={`/veiculos/${order.vehicle.id}`}
                          className="hover:text-slate-200 hover:underline"
                        >
                          {order.vehicle.brand} {order.vehicle.model}
                        </Link>
                        {order.vehicle.plate && (
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {formatPlate(order.vehicle.plate)}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-[10px] mt-0.5">
                        Km entrada: {formatKm(order.mileageIn)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-200 line-clamp-2">{order.problemReported}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {order.responsibleName ? (
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <User className="w-3 h-3 text-slate-500" />
                          {order.responsibleName}
                        </span>
                      ) : (
                        <span className="italic text-slate-500">Não atribuído</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {order.status === 'CONCLUIDO' && order.completedAt ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          {formatDate(order.completedAt)}
                        </span>
                      ) : order.estimatedAt ? (
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {formatDate(order.estimatedAt)}
                        </span>
                      ) : (
                        <span className="italic text-slate-500">Não definida</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatCurrency(Number(order.totalAmount))}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/ordens-de-servico/${order.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                          title="Ver detalhes da O.S."
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {order.status !== 'CONCLUIDO' && (
                          <button
                            onClick={() => setOrderToDelete(order)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Excluir O.S."
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Excluir Ordem de Serviço</h3>
                <p className="text-xs text-slate-400">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Você tem certeza que deseja excluir a{' '}
              <strong className="text-white font-semibold">
                O.S. #{String(orderToDelete.code).padStart(4, '0')}
              </strong>{' '}
              do cliente{' '}
              <strong className="text-white font-semibold">{orderToDelete.client.name}</strong>?
            </p>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] leading-relaxed">
              <strong>Atenção:</strong> Ordens de Serviço já concluídas não podem ser excluídas.
              Se havia um orçamento vinculado, o vínculo será removido.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirmar Exclusão</span>
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
