'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  Bike,
  Wrench,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Gauge,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Loader2,
  DollarSign,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteServiceHistory } from '@/app/actions/serviceHistory';
import { formatPlate, formatKm, formatDate, formatCurrency } from '@/lib/utils';
import { BudgetStatus, VehicleType } from '@prisma/client';

interface VehicleDetailsProps {
  vehicle: {
    id: string;
    type: VehicleType;
    brand: string | null;
    model: string | null;
    year: number | null;
    plate: string | null;
    mileage: number;
    color: string | null;
    chassis: string | null;
    notes: string | null;
    createdAt: Date;
    client: {
      id: string;
      name: string;
      cpf: string | null;
      phone: string;
      email: string | null;
    };
    history: {
      id: string;
      date: Date;
      mileage: number;
      problemReported: string;
      diagnosis: string;
      servicesDone: string;
      partsUsed: string | null;
      notes: string | null;
      totalAmount: any;
      responsibleName: string;
    }[];
    budgets: {
      id: string;
      code: number;
      date: Date;
      expirationDate: Date;
      status: BudgetStatus;
      totalAmount: any;
    }[];
  };
}

export default function VehicleDetailsClient({ vehicle }: VehicleDetailsProps) {
  const router = useRouter();
  const [historyToDelete, setHistoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteHistory = async () => {
    if (!historyToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteServiceHistory(historyToDelete);
      if (!res.success) {
        toast.error(res.error || 'Erro ao remover registro.');
      } else {
        toast.success('Registro de histórico removido.');
        setHistoryToDelete(null);
        router.refresh();
      }
    } catch {
      toast.error('Erro ao excluir histórico.');
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
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/veiculos"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Link href="/veiculos" className="hover:underline">
                Veículos
              </Link>
              <span>/</span>
              <span className="text-slate-200">Prontuário do Veículo</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              {vehicle.brand} {vehicle.model}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/veiculos/${vehicle.id}/editar`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar Veículo</span>
          </Link>
          <Link
            href={`/orcamentos/novo?clientId=${vehicle.client.id}&vehicleId=${vehicle.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>+ Orçamento</span>
          </Link>
          <Link
            href={`/veiculos/${vehicle.id}/novo-servico`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrar Serviço</span>
          </Link>
        </div>
      </div>

      {/* Vehicle Info Card + Owner Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Vehicle Specs */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl border ${
                  vehicle.type === 'CARRO'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {vehicle.type === 'CARRO' ? <Car className="w-7 h-7" /> : <Bike className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white">
                    {vehicle.brand} {vehicle.model}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      vehicle.type === 'CARRO'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {vehicle.type === 'CARRO' ? 'CARRO' : 'MOTO'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Ano Modelo: <strong className="text-slate-200">{vehicle.year}</strong> • Cor:{' '}
                  <strong className="text-slate-200">{vehicle.color || 'Não informada'}</strong>
                </div>
              </div>
            </div>

            {/* Placa Estilo Mercosul */}
            <div className="bg-slate-950 border-2 border-slate-700 rounded-xl p-1.5 shadow-inner text-center min-w-[130px]">
              <div className="bg-blue-800 text-white text-[9px] font-bold px-2 py-0.2 rounded-t flex items-center justify-between">
                <span>BRASIL</span>
                <span className="text-[7px]">MERCOSUL</span>
              </div>
              <div className="font-mono font-black text-base text-white tracking-widest pt-1">
                {formatPlate(vehicle.plate)}
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                Odômetro Atual
              </span>
              <span className="text-base font-bold text-white">{formatKm(vehicle.mileage)}</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                Serviços Registrados
              </span>
              <span className="text-base font-bold text-white">
                {vehicle.history.length} {vehicle.history.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Data de Entrada
              </span>
              <span className="text-base font-bold text-white">{formatDate(vehicle.createdAt)}</span>
            </div>
          </div>

          {vehicle.chassis && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
              <span className="text-slate-400 block text-[11px]">Número do Chassi / VIN:</span>
              <span className="font-mono text-slate-200 font-semibold">{vehicle.chassis}</span>
            </div>
          )}

          {vehicle.notes && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
              <span className="text-slate-400 block text-[11px] mb-0.5">Observações Gerais:</span>
              <span className="text-slate-300 italic">{vehicle.notes}</span>
            </div>
          )}
        </div>

        {/* Owner Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Cliente Proprietário</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Nome Completo</span>
                <Link
                  href={`/clientes/${vehicle.client.id}`}
                  className="text-sm font-bold text-white hover:text-blue-400 hover:underline inline-block mt-0.5"
                >
                  {vehicle.client.name}
                </Link>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Telefone</span>
                <span className="text-slate-200 font-medium">{vehicle.client.phone}</span>
              </div>

              {vehicle.client.email && (
                <div>
                  <span className="text-slate-500 block text-[11px]">E-mail</span>
                  <span className="text-slate-200">{vehicle.client.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4">
            <Link
              href={`/clientes/${vehicle.client.id}`}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Ver Perfil do Cliente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Linha do Tempo / Histórico de Serviços (TIMELINE) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              <span>Linha do Tempo de Manutenções e Serviços</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Histórico permanente e cronológico das intervenções realizadas neste veículo.
            </p>
          </div>

          <Link
            href={`/veiculos/${vehicle.id}/novo-servico`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Serviço ao Histórico</span>
          </Link>
        </div>

        {vehicle.history.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">Nenhum serviço registrado ainda</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Quando este veículo passar por qualquer manutenção, troca de óleo ou reparo, registre o serviço para criar um prontuário permanente.
            </p>
            <Link
              href={`/veiculos/${vehicle.id}/novo-servico`}
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Primeiro Serviço</span>
            </Link>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:inset-y-3 before:left-3 sm:before:left-4 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-slate-700 before:to-slate-800">
            {vehicle.history.map((service, index) => (
              <div key={service.id} className="relative group">
                {/* Timeline Dot Indicator */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-blue-500/30">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                </div>

                {/* Service Card */}
                <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all">
                  {/* Card Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-white flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          {formatDate(service.date)}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          {formatKm(service.mileage)}
                        </span>
                        <span className="text-xs text-slate-400">
                          Responsável: <strong className="text-slate-200">{service.responsibleName}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Total Cobrado
                        </span>
                        <span className="text-lg font-bold text-emerald-400">
                          {formatCurrency(Number(service.totalAmount))}
                        </span>
                      </div>

                      <button
                        onClick={() => setHistoryToDelete(service.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Excluir este registro de histórico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Service Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">
                        Queixa Relatada pelo Cliente:
                      </span>
                      <p className="text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                        {service.problemReported}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">
                        Diagnóstico Técnico:
                      </span>
                      <p className="text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                        {service.diagnosis}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-slate-300 font-semibold block mb-1">
                        Serviços Realizados (Mão de Obra):
                      </span>
                      <p className="text-white font-medium bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                        {service.servicesDone}
                      </p>
                    </div>

                    {service.partsUsed && (
                      <div className="md:col-span-2">
                        <span className="text-slate-400 font-semibold block mb-1">
                          Peças e Componentes Trocados / Aplicados:
                        </span>
                        <p className="text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                          {service.partsUsed}
                        </p>
                      </div>
                    )}

                    {service.notes && (
                      <div className="md:col-span-2">
                        <span className="text-slate-400 font-semibold block mb-1">
                          Observações & Recomendações:
                        </span>
                        <p className="text-slate-400 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                          {service.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orçamentos Vinculados a este Veículo */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Orçamentos Vinculados a este Veículo ({vehicle.budgets.length})</span>
          </h2>
          <Link
            href={`/orcamentos/novo?clientId=${vehicle.client.id}&vehicleId=${vehicle.id}`}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            + Criar Novo Orçamento
          </Link>
        </div>

        {vehicle.budgets.length === 0 ? (
          <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            Nenhum orçamento emitido para este veículo.
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/80">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Data Emissão</th>
                  <th className="py-3 px-4">Validade</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vehicle.budgets.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      #{b.code.toString().padStart(4, '0')}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(b.status)}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(b.date)}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(b.expirationDate)}</td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {formatCurrency(Number(b.totalAmount))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/orcamentos/${b.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                      >
                        Ver Orçamento
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Service History Modal */}
      {historyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Excluir Registro de Histórico</h3>
                <p className="text-xs text-slate-400">Esta ação é irreversível.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja excluir permanentemente este registro de serviço do prontuário
              do veículo?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setHistoryToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteHistory}
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
                    <span>Excluir Permanentemente</span>
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
