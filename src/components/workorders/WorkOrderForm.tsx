'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList,
  ArrowLeft,
  Loader2,
  User,
  Car,
  Bike,
  Wrench,
  Calendar,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { createWorkOrder } from '@/app/actions/workOrders';

interface Client {
  id: string;
  name: string;
  cpf: string | null;
  vehicles: {
    id: string;
    type: 'CARRO' | 'MOTO';
    brand: string | null;
    model: string | null;
    plate: string | null;
    mileage: number;
  }[];
}

interface WorkOrderFormProps {
  clients: Client[];
  // When created from an approved budget
  prefillBudgetId?: string;
  prefillClientId?: string;
  prefillVehicleId?: string;
  prefillProblem?: string;
  prefillServicesDone?: string;
  prefillPartsUsed?: string;
  prefillNotes?: string;
  prefillMileage?: number;
  prefillTotal?: number;
  prefillResponsible?: string;
}

export default function WorkOrderForm({
  clients,
  prefillBudgetId,
  prefillClientId,
  prefillVehicleId,
  prefillProblem,
  prefillServicesDone,
  prefillPartsUsed,
  prefillNotes,
  prefillMileage,
  prefillTotal,
  prefillResponsible,
}: WorkOrderFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [clientId, setClientId] = useState(prefillClientId ?? '');
  const [vehicleId, setVehicleId] = useState(prefillVehicleId ?? '');
  const [problemReported, setProblemReported] = useState(prefillProblem ?? '');
  const [diagnosis, setDiagnosis] = useState('');
  const [servicesDone, setServicesDone] = useState(prefillServicesDone ?? '');
  const [partsUsed, setPartsUsed] = useState(prefillPartsUsed ?? '');
  const [notes, setNotes] = useState(prefillNotes ?? '');
  const [mileageIn, setMileageIn] = useState(prefillMileage ?? 0);
  const [responsibleName, setResponsibleName] = useState(prefillResponsible ?? '');
  const [estimatedAt, setEstimatedAt] = useState('');
  const [totalAmount, setTotalAmount] = useState(prefillTotal ?? 0);

  const selectedClient = clients.find((c) => c.id === clientId);
  const availableVehicles = selectedClient?.vehicles ?? [];
  const selectedVehicle = availableVehicles.find((v) => v.id === vehicleId);

  // Auto-fill mileage from vehicle
  useEffect(() => {
    if (selectedVehicle && !prefillMileage) {
      setMileageIn(selectedVehicle.mileage);
    }
  }, [selectedVehicle, prefillMileage]);

  // Reset vehicle when client changes
  useEffect(() => {
    if (!prefillVehicleId) {
      setVehicleId('');
    }
  }, [clientId, prefillVehicleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast.error('Selecione um cliente.');
      return;
    }
    if (!vehicleId) {
      toast.error('Selecione um veículo.');
      return;
    }
    if (!problemReported.trim()) {
      toast.error('Descreva o problema relatado.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createWorkOrder({
        budgetId: prefillBudgetId,
        clientId,
        vehicleId,
        problemReported,
        diagnosis: diagnosis || undefined,
        servicesDone: servicesDone || undefined,
        partsUsed: partsUsed || undefined,
        notes: notes || undefined,
        mileageIn,
        responsibleName: responsibleName || undefined,
        estimatedAt: estimatedAt || undefined,
        totalAmount,
      });

      if (!res.success) {
        toast.error(res.error || 'Erro ao criar Ordem de Serviço.');
      } else {
        toast.success('Ordem de Serviço criada com sucesso!');
        const wo = res.workOrder as { id?: string };
        router.push(`/ordens-de-servico/${wo?.id}`);
      }
    } catch {
      toast.error('Falha de comunicação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors';
  const labelClass = 'block text-xs font-semibold text-slate-400 mb-1.5';
  const textareaClass = `${inputClass} resize-none`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <Link
          href="/ordens-de-servico"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="text-xs text-slate-400">
            <Link href="/ordens-de-servico" className="hover:underline">
              Ordens de Serviço
            </Link>
            {' / '}
            <span className="text-slate-200">Nova O.S.</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
            <ClipboardList className="w-5 h-5 text-blue-400" />
            {prefillBudgetId ? 'Gerar O.S. do Orçamento' : 'Nova Ordem de Serviço'}
          </h1>
        </div>
      </div>

      {prefillBudgetId && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <strong>📋 Gerada a partir de orçamento aprovado.</strong> Os campos foram pré-preenchidos com os dados do orçamento. Revise e confirme.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente & Veículo */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Cliente e Veículo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cliente *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                disabled={!!prefillClientId}
                className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <option value="">Selecione um cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Veículo *</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
                disabled={!clientId || !!prefillVehicleId}
                className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {clientId ? 'Selecione um veículo...' : 'Primeiro selecione o cliente'}
                </option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.type === 'CARRO' ? '🚗' : '🏍️'} {v.brand} {v.model}
                    {v.plate ? ` – ${v.plate}` : ''}
                  </option>
                ))}
              </select>
              {selectedVehicle && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Km atual no cadastro: {selectedVehicle.mileage.toLocaleString('pt-BR')} km
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dados do Serviço */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-400" />
            Dados do Serviço
          </h2>

          <div>
            <label className={labelClass}>Problema Relatado pelo Cliente *</label>
            <textarea
              value={problemReported}
              onChange={(e) => setProblemReported(e.target.value)}
              rows={3}
              required
              placeholder="Descreva o problema, sintoma ou queixa do cliente..."
              className={textareaClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Diagnóstico Técnico</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={2}
                placeholder="Diagnóstico do mecânico (pode preencher depois)..."
                className={textareaClass}
              />
            </div>

            <div>
              <label className={labelClass}>Serviços a Executar / Executados</label>
              <textarea
                value={servicesDone}
                onChange={(e) => setServicesDone(e.target.value)}
                rows={2}
                placeholder="Serviços e intervenções realizadas (pode preencher depois)..."
                className={textareaClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Peças e Insumos</label>
            <textarea
              value={partsUsed}
              onChange={(e) => setPartsUsed(e.target.value)}
              rows={2}
              placeholder="Peças substituídas, fluidos, filtros, etc. (pode preencher depois)..."
              className={textareaClass}
            />
          </div>

          <div>
            <label className={labelClass}>Observações Internas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Observações internas da oficina..."
              className={textareaClass}
            />
          </div>
        </div>

        {/* Dados Operacionais */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Dados Operacionais
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Km na Entrada *</label>
              <input
                type="number"
                value={mileageIn}
                onChange={(e) => setMileageIn(Number(e.target.value))}
                min={0}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Previsão de Entrega</label>
              <input
                type="date"
                value={estimatedAt}
                onChange={(e) => setEstimatedAt(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Responsável Técnico</label>
              <input
                type="text"
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                placeholder="Nome do mecânico"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Valor Estimado (R$)</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                min={0}
                step={0.01}
                placeholder="0,00"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/ordens-de-servico"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Criando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Criar Ordem de Serviço</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
