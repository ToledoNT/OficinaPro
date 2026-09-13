'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Printer,
  Edit2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Wrench,
  Package,
  Car,
  Bike,
  User,
  Calendar,
  AlertCircle,
  Loader2,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { updateBudgetStatus } from '@/app/actions/budgets';
import { generateWorkOrderFromBudget } from '@/app/actions/workOrders';
import { formatCurrency, formatDate, formatPlate, formatCPF, formatPhone, formatKm } from '@/lib/utils';
import { BudgetStatus, ItemType, VehicleType } from '@prisma/client';

interface BudgetDetailsProps {
  workshopName?: string;
  budget: {
    id: string;
    code: number;
    date: Date;
    expirationDate: Date;
    status: BudgetStatus;
    notes: string | null;
    subtotal: any;
    discount: any;
    totalAmount: any;
    workOrderId: string | null;

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
      year: number | null;
      plate: string | null;
      mileage: number;
      color: string | null;
      type: VehicleType;
    };

    items: {
      id: string;
      type: ItemType;
      description: string;
      quantity: any;
      unitPrice: any;
      discount: any;
      subtotal: any;
    }[];
  };
}


export default function BudgetDetailsClient({ budget, workshopName }: BudgetDetailsProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<BudgetStatus>(budget.status);
  const [updating, setUpdating] = useState(false);
  const [generatingOS, setGeneratingOS] = useState(false);

  const handleGenerateOS = async () => {
    setGeneratingOS(true);
    try {
      const res = await generateWorkOrderFromBudget(budget.id);
      if (!res.success) {
        toast.error(res.error || 'Erro ao gerar Ordem de Serviço.');
      } else {
        toast.success(
          res.alreadyExisted
            ? 'Ordem de Serviço vinculada encontrada!'
            : 'Ordem de Serviço gerada com sucesso a partir deste orçamento!'
        );
        const wo = res.workOrder as { id: string };
        router.push(`/ordens-de-servico/${wo.id}`);
      }
    } catch {
      toast.error('Falha de comunicação ao gerar O.S.');
    } finally {
      setGeneratingOS(false);
    }
  };

  const handleStatusChange = async (newStatus: BudgetStatus) => {
    setUpdating(true);
    try {
      const res = await updateBudgetStatus(budget.id, newStatus);
      if (!res.success) {
        toast.error(res.error || 'Erro ao alterar status.');
      } else {
        setCurrentStatus(newStatus);
        toast.success(`Status do orçamento atualizado para ${newStatus}.`);
        router.refresh();
      }
    } catch {
      toast.error('Falha de comunicação.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (st: BudgetStatus) => {
    switch (st) {
      case 'APROVADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado
          </span>
        );
      case 'ENVIADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3.5 h-3.5" /> Enviado ao Cliente
          </span>
        );
      case 'RASCUNHO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Rascunho
          </span>
        );
      case 'RECUSADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> Recusado
          </span>
        );
      case 'EXPIRADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Expirado
          </span>
        );
    }
  };

  // Separação dos subtotais de mão de obra e peças
  const servicesTotal = budget.items
    .filter((i) => i.type === 'SERVICO')
    .reduce((acc, i) => acc + Number(i.subtotal), 0);

  const partsTotal = budget.items
    .filter((i) => i.type === 'PECA')
    .reduce((acc, i) => acc + Number(i.subtotal), 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/orcamentos"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Link href="/orcamentos" className="hover:underline">
                Orçamentos
              </Link>
              <span>/</span>
              <span className="text-slate-200">#{budget.code.toString().padStart(4, '0')}</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>Proposta Comercial</span>
              <span className="font-mono text-blue-400">
                #{budget.code.toString().padStart(4, '0')}
              </span>
            </h1>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Imprimir / PDF</span>
          </button>
          <Link
            href={`/orcamentos/${budget.id}/editar`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Editar</span>
          </Link>
        </div>
      </div>

      {/* Status Management Workflow Bar (hidden on print) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400">Status Atual:</div>
          <div>{getStatusBadge(currentStatus)}</div>
        </div>

        {/* Quick status transition actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {updating && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}

          {currentStatus !== 'RASCUNHO' && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange('RASCUNHO')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              Rascunho
            </button>
          )}

          {currentStatus !== 'ENVIADO' && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange('ENVIADO')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>Marcar como Enviado</span>
            </button>
          )}

          {currentStatus !== 'APROVADO' && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange('APROVADO')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aprovar Orçamento</span>
            </button>
          )}

          {currentStatus !== 'RECUSADO' && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange('RECUSADO')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-3 h-3" />
              <span>Recusar</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Banner for Approved Budget & Work Order (O.S.) */}
      {currentStatus === 'APROVADO' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-blue-950/70 border border-emerald-500/40 shadow-xl flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Orçamento Aprovado</span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  {budget.workOrderId ? 'O.S. Gerada' : 'Pronto para O.S.'}
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {budget.workOrderId
                  ? 'Já existe uma Ordem de Serviço vinculada a este orçamento.'
                  : 'Gere uma Ordem de Serviço para controlar a execução do serviço.'}
              </p>
            </div>
          </div>

          {budget.workOrderId ? (
            <Link
              href={`/ordens-de-servico/${budget.workOrderId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all whitespace-nowrap"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Ver Ordem de Serviço</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                disabled={generatingOS}
                onClick={handleGenerateOS}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60 whitespace-nowrap"
              >
                {generatingOS ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando O.S...</span>
                  </>
                ) : (
                  <>
                    <ClipboardList className="w-4 h-4" />
                    <span>Gerar Ordem de Serviço</span>
                  </>
                )}
              </button>
              <Link
                href={`/ordens-de-servico/nova?budgetId=${budget.id}`}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors whitespace-nowrap"
                title="Ajustar dados antes de criar a O.S."
              >
                Revisar antes
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Printable Invoice Sheet */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800 print:border-gray-300">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white print:text-black">
                {workshopName || 'OficinaPro Auto & Moto'}
              </span>
            </div>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Centro Especializado em Manutenção de Carros e Motos
            </p>
            <p className="text-xs text-slate-500 print:text-gray-600 mt-1">
              Atendimento Técnico Multimarcas • Peças Genuínas & Serviços
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400 print:text-gray-600 uppercase tracking-wider font-semibold">
              Orçamento Nº
            </div>
            <div className="font-mono font-black text-2xl text-blue-400 print:text-black">
              #{budget.code.toString().padStart(4, '0')}
            </div>
            <div className="mt-1">{getStatusBadge(currentStatus)}</div>
          </div>
        </div>

        {/* Client & Vehicle Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-xs font-bold text-slate-400 print:text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Dados do Cliente</span>
            </h3>
            <div className="space-y-1 text-xs">
              <div className="font-bold text-sm text-white print:text-black">{budget.client.name}</div>
              <div className="text-slate-300 print:text-gray-700">
                CPF: <span className="font-mono">{formatCPF(budget.client.cpf)}</span>
              </div>
              <div className="text-slate-300 print:text-gray-700">
                Telefone: {formatPhone(budget.client.phone)}
              </div>
              {budget.client.email && (
                <div className="text-slate-400 print:text-gray-600">
                  E-mail: {budget.client.email}
                </div>
              )}
              {budget.client.address && (
                <div className="text-slate-400 print:text-gray-600 mt-1 text-[11px]">
                  {budget.client.address}
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-xs font-bold text-slate-400 print:text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              {budget.vehicle.type === 'CARRO' ? (
                <Car className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Bike className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Dados do Veículo</span>
            </h3>
            <div className="space-y-1 text-xs">
              <div className="font-bold text-sm text-white print:text-black flex items-center gap-2">
                <span>
                  {budget.vehicle.brand} {budget.vehicle.model}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 print:bg-gray-200 print:text-black">
                  {formatPlate(budget.vehicle.plate)}
                </span>
              </div>
              <div className="text-slate-300 print:text-gray-700">
                Tipo: {budget.vehicle.type === 'CARRO' ? 'Carro / Automóvel' : 'Moto / Motocicleta'}{' '}
                • Ano: {budget.vehicle.year}
              </div>
              <div className="text-slate-300 print:text-gray-700">
                Km Atual: {formatKm(budget.vehicle.mileage)} • Cor:{' '}
                {budget.vehicle.color || 'Não informada'}
              </div>
              <div className="text-slate-400 print:text-gray-600 flex items-center gap-2 pt-1">
                <span>Emissão: {formatDate(budget.date)}</span>
                <span>•</span>
                <span className="font-semibold text-amber-400 print:text-amber-700">
                  Válido até: {formatDate(budget.expirationDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 print:text-gray-700 uppercase tracking-wider">
            Detalhamento dos Serviços e Peças
          </h3>

          <div className="overflow-x-auto border border-slate-800 rounded-xl print:border-gray-300">
            <table className="w-full text-left text-xs text-slate-300 print:text-gray-800">
              <thead className="bg-slate-950/70 text-slate-400 print:bg-gray-100 print:text-gray-700 uppercase tracking-wider text-[10px] border-b border-slate-800 print:border-gray-300">
                <tr>
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3 w-28">Tipo</th>
                  <th className="py-2.5 px-3">Descrição</th>
                  <th className="py-2.5 px-3 text-center w-16">Qtd</th>
                  <th className="py-2.5 px-3 text-right w-24">Valor Unit.</th>
                  <th className="py-2.5 px-3 text-right w-20">Desconto</th>
                  <th className="py-2.5 px-3 text-right w-28">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                {budget.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-800/20">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{index + 1}</td>
                    <td className="py-2.5 px-3">
                      {item.type === 'SERVICO' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 print:bg-blue-50 print:text-blue-700">
                          <Wrench className="w-3 h-3" /> Serviço
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 print:bg-amber-50 print:text-amber-700">
                          <Package className="w-3 h-3" /> Peça
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white print:text-black">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{Number(item.quantity)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatCurrency(Number(item.unitPrice))}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {Number(item.discount) > 0 ? formatCurrency(Number(item.discount)) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">
                      {formatCurrency(Number(item.subtotal))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-800 print:border-gray-300">
          <div className="text-xs text-slate-400 max-w-sm">
            {budget.notes ? (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 print:bg-gray-50 print:border-gray-200">
                <span className="font-bold text-slate-300 print:text-black block mb-1">
                  Observações:
                </span>
                <p className="italic text-slate-300 print:text-gray-700">{budget.notes}</p>
              </div>
            ) : null}
          </div>

          <div className="w-full sm:w-72 space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs">
            <div className="flex items-center justify-between text-slate-400 print:text-gray-600">
              <span>Mão de Obra (Serviços):</span>
              <span className="font-mono font-semibold text-slate-200 print:text-black">
                {formatCurrency(servicesTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 print:text-gray-600">
              <span>Peças & Insumos:</span>
              <span className="font-mono font-semibold text-slate-200 print:text-black">
                {formatCurrency(partsTotal)}
              </span>
            </div>

            {Number(budget.discount) > 0 && (
              <div className="flex items-center justify-between text-amber-400 print:text-amber-700">
                <span>Desconto Concedido:</span>
                <span className="font-mono font-semibold">
                  - {formatCurrency(Number(budget.discount))}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 print:border-gray-300 flex items-center justify-between text-sm font-bold">
              <span className="text-white print:text-black">VALOR TOTAL:</span>
              <span className="text-emerald-400 print:text-black font-mono text-lg font-black">
                {formatCurrency(Number(budget.totalAmount))}
              </span>
            </div>
          </div>
        </div>

        {/* Print Signatures Block */}
        <div className="hidden print:grid grid-cols-2 gap-12 pt-16 text-center text-xs text-gray-700">
          <div>
            <div className="border-t border-gray-400 pt-2 font-semibold">
              Assinatura do Cliente
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">{budget.client.name}</div>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-2 font-semibold">
              Responsável Técnico da Oficina
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {workshopName || 'OficinaPro Auto & Moto'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
