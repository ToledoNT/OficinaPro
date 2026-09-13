import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import {
  Users,
  Car,
  Bike,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Wrench,
  Calendar,
  ClipboardList,
} from 'lucide-react';
import { formatCurrency, formatDate, formatKm, formatPlate } from '@/lib/utils';
import { BudgetStatus, WorkOrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  const workshopId = currentUser?.workshopId || '';

  // Buscar dados isolados por oficina em paralelo
  const [
    totalClients,
    totalVehicles,
    carsCount,
    motosCount,
    openBudgetsCount,
    approvedBudgetsCount,
    activeWorkOrdersCount,
    budgetsAggregate,
    recentServices,
    allBudgets,
  ] = await Promise.all([
    prisma.client.count({ where: { workshopId } }),
    prisma.vehicle.count({ where: { workshopId } }),
    prisma.vehicle.count({ where: { workshopId, type: 'CARRO' } }),
    prisma.vehicle.count({ where: { workshopId, type: 'MOTO' } }),
    prisma.budget.count({
      where: {
        workshopId,
        status: { in: [BudgetStatus.RASCUNHO, BudgetStatus.ENVIADO] },
      },
    }),
    prisma.budget.count({ where: { workshopId, status: BudgetStatus.APROVADO } }),
    prisma.workOrder.count({
      where: {
        workshopId,
        status: { in: [WorkOrderStatus.AGUARDANDO, WorkOrderStatus.EM_EXECUCAO, WorkOrderStatus.PAUSADO] },
      },
    }),
    prisma.budget.aggregate({
      where: { workshopId },
      _sum: { totalAmount: true },
    }),
    prisma.serviceHistory.findMany({
      where: { workshopId },
      take: 6,
      orderBy: { date: 'desc' },
      include: {
        vehicle: {
          include: {
            client: true,
          },
        },
      },
    }),
    prisma.budget.findMany({
      where: { workshopId },
      select: {
        status: true,
        totalAmount: true,
      },
    }),
  ]);

  const totalBudgetsAmount = Number(budgetsAggregate._sum.totalAmount || 0);

  // Mapear status para o gráfico
  const statusMeta: Record<BudgetStatus, { label: string; color: string }> = {
    RASCUNHO: { label: 'Rascunho', color: '#64748b' },
    ENVIADO: { label: 'Enviado', color: '#3b82f6' },
    APROVADO: { label: 'Aprovado', color: '#10b981' },
    RECUSADO: { label: 'Recusado', color: '#ef4444' },
    EXPIRADO: { label: 'Expirado', color: '#f59e0b' },
  };

  const budgetsStatusData = Object.entries(statusMeta).map(([status, meta]) => {
    const items = allBudgets.filter((b) => b.status === status);
    const amount = items.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
    return {
      status,
      label: meta.label,
      count: items.length,
      amount,
      color: meta.color,
    };
  });

  return (
    <AppShell user={currentUser}>
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{currentUser?.workshopName || 'Painel da Oficina'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              Visão Geral
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Acompanhe o fluxo de veículos, ordens de serviço, manutenções e faturamento em tempo real.
          </p>
        </div>

        {/* Quick Actions Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/clientes/novo"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>+ Cliente</span>
          </Link>
          <Link
            href="/veiculos/novo"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
          >
            <Car className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Veículo</span>
          </Link>
          <Link
            href="/ordens-de-servico/nova"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
          >
            <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ O.S.</span>
          </Link>
          <Link
            href="/orcamentos/novo"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Orçamento</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        {/* Total Clientes */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Clientes</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">{totalClients}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <Link
              href="/clientes"
              className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 group-hover:underline"
            >
              Ver clientes <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Veículos & Carros/Motos */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Frota Atendida</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{totalVehicles}</span>
            <span className="text-xs text-slate-400">veículos</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 text-[11px] flex items-center gap-0.5 font-medium">
                {carsCount} carros
              </span>
              <span className="text-emerald-400 text-[11px] flex items-center gap-0.5 font-medium">
                {motosCount} motos
              </span>
            </div>
            <Link href="/veiculos" className="text-slate-400 hover:text-white">
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Ordens de Serviço Ativas */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Ordens de Serviço</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{activeWorkOrdersCount}</span>
            <span className="text-xs text-cyan-400 font-medium">em execução</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <Link href="/ordens-de-servico" className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1">
              Gerenciar O.S. <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Orçamentos em Aberto e Aprovados */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Orçamentos</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{openBudgetsCount}</span>
            <span className="text-xs text-amber-400 font-medium">em aberto</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> {approvedBudgetsCount} aprovados
            </span>
            <Link href="/orcamentos" className="text-slate-400 hover:text-white">
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Volume Total em Orçamentos */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Orçado</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">
              {formatCurrency(totalBudgetsAmount)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Orçamentos emitidos</span>
            <Link href="/orcamentos" className="text-purple-400 hover:text-purple-300 font-medium">
              Ver
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <DashboardCharts
        carsCount={carsCount}
        motosCount={motosCount}
        budgetsStatusData={budgetsStatusData}
      />

      {/* Recent Services Table */}
      <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Serviços e Manutenções Recentes</h2>
              <p className="text-xs text-slate-400">
                Últimos serviços executados e registrados na oficina
              </p>
            </div>
          </div>
          <Link
            href="/veiculos"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 self-start sm:self-auto"
          >
            Ver todos veículos e históricos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentServices.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            Nenhum serviço registrado ainda nesta oficina.
          </div>
        ) : (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/80">
                <tr>
                  <th className="py-3 px-4">Veículo & Placa</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Cliente Proprietário</th>
                  <th className="py-3 px-4">Serviço Realizado</th>
                  <th className="py-3 px-4">Data & Km</th>
                  <th className="py-3 px-4">Mecânico</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      <div className="font-semibold text-slate-100">
                        {service.vehicle.brand} {service.vehicle.model}
                      </div>
                      <div className="inline-block mt-0.5 px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px] border border-slate-700">
                        {formatPlate(service.vehicle.plate)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {service.vehicle.type === 'CARRO' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Car className="w-3 h-3" /> Carro
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Bike className="w-3 h-3" /> Moto
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/clientes/${service.vehicle.client.id}`}
                        className="text-blue-400 hover:underline font-medium"
                      >
                        {service.vehicle.client.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                      {service.servicesDone}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(service.date)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatKm(service.mileage)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{service.responsibleName}</td>
                    <td className="py-3 px-4 text-right font-bold text-white whitespace-nowrap">
                      {formatCurrency(Number(service.totalAmount))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/veiculos/${service.vehicle.id}`}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                        title="Ver histórico do veículo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
