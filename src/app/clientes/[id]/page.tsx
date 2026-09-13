import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import {
  Users,
  Car,
  Bike,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  FileText,
  Plus,
  Edit2,
  ArrowLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  formatCPF,
  formatPhone,
  formatDate,
  formatCurrency,
  formatKm,
  formatPlate,
} from '@/lib/utils';
import { BudgetStatus } from '@prisma/client';

interface ClienteDetalheProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ClienteDetalhePage({ params }: ClienteDetalheProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const workshopId = currentUser?.workshopId || '';

  const client = await prisma.client.findFirst({
    where: { id, workshopId },
    include: {
      vehicles: {
        orderBy: { createdAt: 'desc' },
        include: {
          history: {
            orderBy: { date: 'desc' },
          },
          _count: {
            select: { history: true, budgets: true },
          },
        },
      },
      budgets: {
        orderBy: { date: 'desc' },
        include: {
          vehicle: true,
        },
      },
    },
  });

  if (!client) {
    notFound();
  }

  // Agrega todo o histórico de todos os veículos do cliente
  const allServices = client.vehicles
    .flatMap((v) =>
      v.history.map((h) => ({
        ...h,
        vehicle: v,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusBadge = (status: BudgetStatus) => {
    switch (status) {
      case 'APROVADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Aprovado
          </span>
        );
      case 'ENVIADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3 h-3" /> Enviado
          </span>
        );
      case 'RASCUNHO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Rascunho
          </span>
        );
      case 'RECUSADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" /> Recusado
          </span>
        );
      case 'EXPIRADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Expirado
          </span>
        );
    }
  };

  return (
    <AppShell user={currentUser}>
      <div className="space-y-6">
        {/* Top Breadcrumb / Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              href="/clientes"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Link href="/clientes" className="hover:underline">
                  Clientes
                </Link>
                <span>/</span>
                <span className="text-slate-200">Detalhes</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                {client.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/clientes/${client.id}/editar`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Dados</span>
            </Link>
            <Link
              href={`/veiculos/novo?clientId=${client.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Car className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Veículo</span>
            </Link>
            <Link
              href={`/orcamentos/novo?clientId=${client.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Orçamento</span>
            </Link>
          </div>
        </div>

        {/* Client Info Summary Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Ficha Cadastral do Cliente</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1">CPF</span>
              <span className="font-mono text-white text-sm font-semibold">
                {formatCPF(client.cpf)}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Telefone / WhatsApp</span>
              <span className="text-white text-sm font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                {formatPhone(client.phone)}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1">E-mail</span>
              <span className="text-white text-sm truncate block font-medium">
                {client.email || <span className="text-slate-500 italic">Não informado</span>}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Data de Cadastro</span>
              <span className="text-white text-sm font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                {formatDate(client.createdAt)}
              </span>
            </div>

            {client.address && (
              <div className="sm:col-span-2 lg:col-span-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Endereço</span>
                  <span className="text-slate-200 text-xs">{client.address}</span>
                </div>
              </div>
            )}

            {client.notes && (
              <div className="sm:col-span-2 lg:col-span-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px] mb-0.5">Observações</span>
                <span className="text-slate-300 text-xs italic">{client.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section: Veículos do Cliente */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-amber-400" />
              <span>Veículos Cadastrados ({client.vehicles.length})</span>
            </h2>
            <Link
              href={`/veiculos/novo?clientId=${client.id}`}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
            >
              + Adicionar Veículo
            </Link>
          </div>

          {client.vehicles.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
              <Car className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Este cliente ainda não possui veículos cadastrados.</p>
              <Link
                href={`/veiculos/novo?clientId=${client.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-3 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cadastrar Veículo Agora</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {client.vehicles.map((v) => (
                <div
                  key={v.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      {v.type === 'CARRO' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Car className="w-3.5 h-3.5" /> Carro
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Bike className="w-3.5 h-3.5" /> Moto
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 bg-slate-950 text-white font-mono text-xs font-bold rounded-lg border border-slate-700">
                        {formatPlate(v.plate)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                      {v.brand} {v.model}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ano: {v.year} • Cor: {v.color || 'Não informada'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Km Atual</span>
                        <span className="font-semibold text-slate-200">{formatKm(v.mileage)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">Serviços Feitos</span>
                        <span className="font-semibold text-emerald-400">{v._count.history} registros</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <Link
                      href={`/veiculos/${v.id}`}
                      className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-xl text-xs font-medium text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Ver Histórico Completo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Histórico Consolidado de Serviços de Todos os Veículos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <span>Histórico Geral de Serviços Realizados ({allServices.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Linha do tempo consolidada de todos os atendimentos feitos aos veículos deste cliente
              </p>
            </div>
          </div>

          {allServices.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
              Nenhum serviço realizado ainda para os veículos deste cliente.
            </div>
          ) : (
            <div className="space-y-3">
              {allServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                        {service.vehicle.type === 'CARRO' ? (
                          <Car className="w-4 h-4" />
                        ) : (
                          <Bike className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            {service.vehicle.brand} {service.vehicle.model}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                            {formatPlate(service.vehicle.plate)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{formatDate(service.date)}</span>
                          <span>•</span>
                          <span>Km no atendimento: {formatKm(service.mileage)}</span>
                          <span>•</span>
                          <span>Mecânico: {service.responsibleName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Valor Total
                      </span>
                      <span className="text-base font-bold text-emerald-400">
                        {formatCurrency(Number(service.totalAmount))}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">
                        Problema Relatado / Queixa:
                      </span>
                      <p className="text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                        {service.problemReported}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">
                        Diagnóstico Técnico:
                      </span>
                      <p className="text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                        {service.diagnosis}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-slate-400 font-semibold block mb-0.5">
                        Serviços Executados:
                      </span>
                      <p className="text-white bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                        {service.servicesDone}
                      </p>
                    </div>

                    {service.partsUsed && (
                      <div className="md:col-span-2">
                        <span className="text-slate-400 font-semibold block mb-0.5">
                          Peças e Insumos Utilizados:
                        </span>
                        <p className="text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                          {service.partsUsed}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Orçamentos do Cliente */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span>Orçamentos Emitidos ({client.budgets.length})</span>
            </h2>
          </div>

          {client.budgets.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
              Nenhum orçamento emitido para este cliente.
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/80">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Veículo</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Data Emissão</th>
                    <th className="py-3 px-4">Validade</th>
                    <th className="py-3 px-4 text-right">Valor Total</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {client.budgets.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">
                        #{b.code.toString().padStart(4, '0')}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {b.vehicle.brand} {b.vehicle.model} ({formatPlate(b.vehicle.plate)})
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
      </div>
    </AppShell>
  );
}
