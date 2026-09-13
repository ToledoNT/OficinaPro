'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Pause,
  Car,
  Bike,
  User,
  Wrench,
  Package,
  AlertCircle,
  Loader2,
  Calendar,
  Gauge,
  Edit3,
  FileText,
  Sparkles,
  Save,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import { updateWorkOrderStatus, concludeWorkOrder, updateWorkOrder } from '@/app/actions/workOrders';
import {
  formatCurrency,
  formatDate,
  formatKm,
  formatPlate,
  formatCPF,
  formatPhone,
} from '@/lib/utils';
import { WorkOrderStatus, VehicleType } from '@prisma/client';

interface WorkOrderDetailsProps {
  workOrder: {
    id: string;
    code: number;
    status: WorkOrderStatus;
    problemReported: string;
    diagnosis: string | null;
    servicesDone: string | null;
    partsUsed: string | null;
    notes: string | null;
    mileageIn: number;
    mileageOut: number | null;
    estimatedAt: Date | null;
    startedAt: Date | null;
    completedAt: Date | null;
    totalAmount: any;
    responsibleName: string | null;
    serviceHistoryId: string | null;
    createdAt: Date;
    client: {
      id: string;
      name: string;
      cpf: string | null;
      phone: string;
      email: string | null;
      address: string | null;
    };
    vehicle: {
      id: string;
      brand: string | null;
      model: string | null;
      plate: string | null;
      year: number | null;
      mileage: number;
      color: string | null;
      type: VehicleType;
    };
    budget: {
      id: string;
      code: number;
    } | null;
  };
  workshopName?: string;
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

export default function WorkOrderDetailsClient({
  workOrder,
  workshopName,
}: WorkOrderDetailsProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<WorkOrderStatus>(workOrder.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Conclude modal state
  const [showConcludeModal, setShowConcludeModal] = useState(false);
  const [concluding, setConcluding] = useState(false);
  const [cServicesDone, setCServicesDone] = useState(workOrder.servicesDone ?? '');
  const [cPartsUsed, setCPartsUsed] = useState(workOrder.partsUsed ?? '');
  const [cMileageOut, setCMileageOut] = useState(workOrder.mileageOut ?? workOrder.mileageIn);
  const [cResponsible, setCResponsible] = useState(workOrder.responsibleName ?? '');
  const [cTotal, setCTotal] = useState(Number(workOrder.totalAmount));
  const [cNotes, setCNotes] = useState(workOrder.notes ?? '');
  const [cGenerateHistory, setCGenerateHistory] = useState(true);

  // Edit fields (inline for non-concluded)
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [savingField, setSavingField] = useState(false);

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    if (newStatus === 'CONCLUIDO') {
      setShowConcludeModal(true);
      return;
    }
    setUpdatingStatus(true);
    try {
      const res = await updateWorkOrderStatus(workOrder.id, newStatus);
      if (!res.success) {
        toast.error(res.error || 'Erro ao alterar status.');
      } else {
        setCurrentStatus(newStatus);
        toast.success(`Status atualizado para ${statusConfig[newStatus].label}.`);
        router.refresh();
      }
    } catch {
      toast.error('Falha de comunicação.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConclude = async () => {
    if (!cServicesDone.trim()) {
      toast.error('Descreva os serviços executados para concluir.');
      return;
    }
    if (!cResponsible.trim()) {
      toast.error('Informe o responsável técnico.');
      return;
    }
    if (cMileageOut < workOrder.mileageIn) {
      toast.error('Km de saída não pode ser menor que a de entrada.');
      return;
    }
    setConcluding(true);
    try {
      const res = await concludeWorkOrder(workOrder.id, {
        servicesDone: cServicesDone,
        partsUsed: cPartsUsed || undefined,
        mileageOut: cMileageOut,
        responsibleName: cResponsible,
        totalAmount: cTotal,
        notes: cNotes || undefined,
        generateHistory: cGenerateHistory,
      });
      if (!res.success) {
        toast.error(res.error || 'Erro ao concluir O.S.');
      } else {
        toast.success('Ordem de Serviço concluída com sucesso!');
        setCurrentStatus('CONCLUIDO');
        setShowConcludeModal(false);
        router.refresh();
      }
    } catch {
      toast.error('Falha de comunicação.');
    } finally {
      setConcluding(false);
    }
  };

  const cfg = statusConfig[currentStatus];
  const Icon = cfg.icon;

  const inputClass =
    'w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors';
  const textareaClass = `${inputClass} resize-none`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/ordens-de-servico"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Link href="/ordens-de-servico" className="hover:underline">
                Ordens de Serviço
              </Link>
              <span>/</span>
              <span className="text-slate-200">#{String(workOrder.code).padStart(4, '0')}</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <ClipboardList className="w-5 h-5 text-blue-400" />
              Ordem de Serviço{' '}
              <span className="font-mono text-blue-400">
                #{String(workOrder.code).padStart(4, '0')}
              </span>
            </h1>
          </div>
        </div>

        {/* Origin budget link */}
        {workOrder.budget && (
          <Link
            href={`/orcamentos/${workOrder.budget.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Orçamento #{String(workOrder.budget.code).padStart(4, '0')}</span>
          </Link>
        )}
      </div>

      {/* Status Workflow Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400">Status:</div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.bgClass} ${cfg.colorClass}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
          </span>
          {workOrder.startedAt && (
            <span className="text-xs text-slate-500">
              Iniciado: {formatDate(workOrder.startedAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {updatingStatus && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}

          {currentStatus !== 'CONCLUIDO' && currentStatus !== 'CANCELADO' && (
            <>
              {currentStatus !== 'AGUARDANDO' && (
                <button
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('AGUARDANDO')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Clock className="w-3 h-3" />
                  <span>Aguardando</span>
                </button>
              )}
              {currentStatus !== 'EM_EXECUCAO' && (
                <button
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('EM_EXECUCAO')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3 h-3" />
                  <span>Iniciar Execução</span>
                </button>
              )}
              {currentStatus !== 'PAUSADO' && (
                <button
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('PAUSADO')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-600/20 border border-slate-500/40 text-slate-300 hover:bg-slate-600/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Pause className="w-3 h-3" />
                  <span>Pausar</span>
                </button>
              )}
              <button
                disabled={updatingStatus}
                onClick={() => setShowConcludeModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Concluir O.S.</span>
              </button>
              <button
                disabled={updatingStatus}
                onClick={() => handleStatusChange('CANCELADO')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3 h-3" />
                <span>Cancelar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Concluded Banner */}
      {currentStatus === 'CONCLUIDO' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                O.S. Concluída{' '}
                {workOrder.completedAt && (
                  <span className="text-slate-400 font-normal text-xs">
                    em {formatDate(workOrder.completedAt)}
                  </span>
                )}
              </h3>
              {workOrder.serviceHistoryId ? (
                <p className="text-xs text-emerald-300 mt-0.5 flex items-center gap-1">
                  <History className="w-3 h-3" />
                  Histórico de serviço gerado automaticamente.
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5">
                  Serviço finalizado. Histórico não foi gerado automaticamente.
                </p>
              )}
            </div>
          </div>
          {workOrder.serviceHistoryId && (
            <Link
              href={`/veiculos/${workOrder.vehicle.id}`}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors whitespace-nowrap"
            >
              Ver no Veículo
            </Link>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Client & Vehicle */}
        <div className="lg:col-span-1 space-y-4">
          {/* Client Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Cliente
            </h3>
            <Link
              href={`/clientes/${workOrder.client.id}`}
              className="text-sm font-bold text-white hover:text-blue-400 hover:underline block"
            >
              {workOrder.client.name}
            </Link>
            <div className="text-xs text-slate-400 space-y-1 mt-2">
              {workOrder.client.cpf && (
                <div>CPF: <span className="font-mono text-slate-300">{formatCPF(workOrder.client.cpf)}</span></div>
              )}
              <div>Tel: {formatPhone(workOrder.client.phone)}</div>
              {workOrder.client.email && <div>{workOrder.client.email}</div>}
              {workOrder.client.address && (
                <div className="text-slate-500 text-[11px]">{workOrder.client.address}</div>
              )}
            </div>
          </div>

          {/* Vehicle Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              {workOrder.vehicle.type === 'CARRO' ? (
                <Car className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Bike className="w-3.5 h-3.5 text-emerald-400" />
              )}
              Veículo
            </h3>
            <Link
              href={`/veiculos/${workOrder.vehicle.id}`}
              className="text-sm font-bold text-white hover:text-blue-400 hover:underline block"
            >
              {workOrder.vehicle.brand} {workOrder.vehicle.model}
            </Link>
            {workOrder.vehicle.plate && (
              <div className="mt-1 inline-block font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                {formatPlate(workOrder.vehicle.plate)}
              </div>
            )}
            <div className="text-xs text-slate-400 space-y-1 mt-2">
              {workOrder.vehicle.year && <div>Ano: {workOrder.vehicle.year}</div>}
              {workOrder.vehicle.color && <div>Cor: {workOrder.vehicle.color}</div>}
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-slate-500" />
                <span>Km entrada: {formatKm(workOrder.mileageIn)}</span>
              </div>
              {workOrder.mileageOut && (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Gauge className="w-3 h-3" />
                  <span>Km saída: {formatKm(workOrder.mileageOut)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dates Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Datas
            </h3>
            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Abertura:</span>
                <span className="text-slate-300">{formatDate(workOrder.createdAt)}</span>
              </div>
              {workOrder.estimatedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Previsão:</span>
                  <span className="text-amber-400 font-semibold">{formatDate(workOrder.estimatedAt)}</span>
                </div>
              )}
              {workOrder.startedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Início:</span>
                  <span className="text-blue-400">{formatDate(workOrder.startedAt)}</span>
                </div>
              )}
              {workOrder.completedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Conclusão:</span>
                  <span className="text-emerald-400 font-semibold">{formatDate(workOrder.completedAt)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                <span className="text-slate-400">Valor Total:</span>
                <span className="text-emerald-400 font-mono">{formatCurrency(Number(workOrder.totalAmount))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Service Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Problem & Diagnosis */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Problema e Diagnóstico
            </h3>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Problema Relatado pelo Cliente
              </div>
              <p className="text-sm text-slate-200 bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
                {workOrder.problemReported}
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Diagnóstico Técnico
              </div>
              {workOrder.diagnosis ? (
                <p className="text-sm text-slate-200 bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
                  {workOrder.diagnosis}
                </p>
              ) : (
                <p className="text-xs italic text-slate-500 bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
                  Diagnóstico ainda não registrado.
                </p>
              )}
            </div>
          </div>

          {/* Services & Parts */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              Execução do Serviço
            </h3>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Wrench className="w-3 h-3" />
                Serviços Executados
              </div>
              {workOrder.servicesDone ? (
                <p className="text-sm text-slate-200 bg-slate-950/40 rounded-xl p-3 border border-slate-800/50 whitespace-pre-line">
                  {workOrder.servicesDone}
                </p>
              ) : (
                <p className="text-xs italic text-slate-500 bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
                  Serviços ainda não registrados.
                </p>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Package className="w-3 h-3" />
                Peças e Insumos
              </div>
              {workOrder.partsUsed ? (
                <p className="text-sm text-slate-200 bg-slate-950/40 rounded-xl p-3 border border-slate-800/50 whitespace-pre-line">
                  {workOrder.partsUsed}
                </p>
              ) : (
                <p className="text-xs italic text-slate-500 bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
                  Nenhuma peça registrada.
                </p>
              )}
            </div>

            {workOrder.responsibleName && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-sm">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-slate-400">Responsável:</span>
                <span className="text-slate-200 font-semibold">{workOrder.responsibleName}</span>
              </div>
            )}

            {workOrder.notes && (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400">
                <strong className="text-slate-300 block mb-1">Observações:</strong>
                <span className="italic">{workOrder.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONCLUDE MODAL */}
      {showConcludeModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Concluir Ordem de Serviço</h3>
                <p className="text-xs text-slate-400">
                  Preencha os dados finais antes de marcar como concluída.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Serviços Executados *
                </label>
                <textarea
                  value={cServicesDone}
                  onChange={(e) => setCServicesDone(e.target.value)}
                  rows={3}
                  required
                  placeholder="Descreva todos os serviços realizados..."
                  className={textareaClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Peças e Insumos Utilizados
                </label>
                <textarea
                  value={cPartsUsed}
                  onChange={(e) => setCPartsUsed(e.target.value)}
                  rows={2}
                  placeholder="Peças substituídas, fluidos, etc."
                  className={textareaClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Km de Saída *
                  </label>
                  <input
                    type="number"
                    value={cMileageOut}
                    onChange={(e) => setCMileageOut(Number(e.target.value))}
                    min={workOrder.mileageIn}
                    required
                    className={inputClass}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Entrada: {formatKm(workOrder.mileageIn)}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Valor Total Cobrado (R$) *
                  </label>
                  <input
                    type="number"
                    value={cTotal}
                    onChange={(e) => setCTotal(Number(e.target.value))}
                    min={0}
                    step={0.01}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Responsável Técnico *
                </label>
                <input
                  type="text"
                  value={cResponsible}
                  onChange={(e) => setCResponsible(e.target.value)}
                  placeholder="Nome do mecânico responsável"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Observações Finais
                </label>
                <textarea
                  value={cNotes}
                  onChange={(e) => setCNotes(e.target.value)}
                  rows={2}
                  placeholder="Recomendações, próximas manutenções, garantia, etc."
                  className={textareaClass}
                />
              </div>

              {/* Generate history checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cGenerateHistory}
                  onChange={(e) => setCGenerateHistory(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-emerald-500"
                />
                <div>
                  <div className="text-sm font-semibold text-emerald-300 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    Gerar histórico de serviço automaticamente
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Cria um registro na timeline do veículo com todos os dados desta O.S.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={concluding}
                onClick={() => setShowConcludeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={concluding}
                onClick={handleConclude}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {concluding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Concluindo...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmar Conclusão</span>
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
