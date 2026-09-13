'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wrench, Save, ArrowLeft, Loader2, Gauge, DollarSign, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { createServiceHistory } from '@/app/actions/serviceHistory';
import { ServiceHistoryFormData } from '@/lib/validations/serviceHistory';
import { formatPlate } from '@/lib/utils';

interface ServiceHistoryFormProps {
  vehicle: {
    id: string;
    brand: string | null;
    model: string | null;
    plate: string | null;
    mileage: number;
    type: string;
  };
  currentUser?: {
    name: string;
  } | null;
}


export default function ServiceHistoryForm({ vehicle, currentUser }: ServiceHistoryFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<ServiceHistoryFormData>({
    vehicleId: vehicle.id,
    date: new Date().toISOString().split('T')[0],
    mileage: vehicle.mileage,
    problemReported: '',
    diagnosis: '',
    servicesDone: '',
    partsUsed: '',
    notes: '',
    totalAmount: 0,
    responsibleName: currentUser?.name || 'Marcos Silva',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createServiceHistory(formData);
      if (!res.success) {
        toast.error(res.error || 'Erro ao registrar serviço no histórico.');
      } else {
        toast.success('Serviço registrado no histórico com sucesso!');
        router.push(`/veiculos/${vehicle.id}`);
        router.refresh();
      }
    } catch {
      toast.error('Erro de conexão ao salvar histórico.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href={`/veiculos/${vehicle.id}`}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" />
              <span>Novo Registro de Serviço</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Veículo: <strong className="text-white">{vehicle.brand} {vehicle.model}</strong> •
              Placa: <strong className="font-mono text-white">{formatPlate(vehicle.plate)}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Data do Serviço */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data da Realização <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Quilometragem no Atendimento */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              <span>Quilometragem no Serviço (Km) <span className="text-red-400">*</span></span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            {formData.mileage > vehicle.mileage && (
              <p className="text-[11px] text-emerald-400 mt-1">
                A quilometragem do veículo será atualizada de {vehicle.mileage.toLocaleString()} para {formData.mileage.toLocaleString()} km.
              </p>
            )}
          </div>

          {/* Mecânico Responsável */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Mecânico / Técnico Responsável <span className="text-red-400">*</span></span>
            </label>
            <input
              type="text"
              required
              value={formData.responsibleName}
              onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
              placeholder="Ex: Marcos Silva"
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Valor Total do Serviço */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Valor Total Cobrado (R$) <span className="text-red-400">*</span></span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              min={0}
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Reclamação / Queixa do Cliente */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Problema Relatado pelo Cliente <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.problemReported}
              onChange={(e) => setFormData({ ...formData, problemReported: e.target.value })}
              placeholder="Ex: Cliente relatou ruído metálico nas rodas dianteiras ao frear e vibração no pedal acima de 80 km/h."
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Diagnóstico Técnico */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Diagnóstico Técnico Realizado <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Ex: Discos de freio dianteiros empenados e pastilhas no limite de segurança."
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Serviços Realizados */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Serviços Realizados (Mão de Obra) <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.servicesDone}
              onChange={(e) => setFormData({ ...formData, servicesDone: e.target.value })}
              placeholder="Ex: Troca dos discos dianteiros, troca de pastilhas dianteiras e sangria do fluido de freio."
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Peças Utilizadas */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Peças e Insumos Utilizados (Opcional)
            </label>
            <textarea
              rows={2}
              value={formData.partsUsed || ''}
              onChange={(e) => setFormData({ ...formData, partsUsed: e.target.value })}
              placeholder="Ex: Par de discos Fremax, Jogo de pastilhas Fras-le, 1L Fluido DOT4."
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Observações */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observações Adicionais / Recomendações Futuras (Opcional)
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Teste de rodagem efetuado. Recomenda-se revisar pastilhas traseiras na próxima revisão aos 95.000 km."
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            href={`/veiculos/${vehicle.id}`}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar no Histórico Permanente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
