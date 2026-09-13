'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Bike, Save, ArrowLeft, Loader2, Gauge } from 'lucide-react';
import { toast } from 'sonner';
import { createVehicle, updateVehicle } from '@/app/actions/vehicles';
import { VehicleFormData } from '@/lib/validations/vehicle';
import { VehicleType } from '@prisma/client';

interface VehicleFormProps {
  initialData?: {
    id: string;
    type: VehicleType;
    brand: string | null;
    model: string | null;
    year: number | null;
    plate: string | null;
    mileage: number;
    color?: string | null;
    chassis?: string | null;
    notes?: string | null;
    clientId: string;
  };
  clients: {
    id: string;
    name: string;
    cpf: string | null;
  }[];
  preselectedClientId?: string;
}


export default function VehicleForm({
  initialData,
  clients,
  preselectedClientId,
}: VehicleFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<VehicleFormData>({
    type: initialData?.type || 'CARRO',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    plate: initialData?.plate || '',
    mileage: initialData?.mileage || 0,
    color: initialData?.color || '',
    chassis: initialData?.chassis || '',
    notes: initialData?.notes || '',
    clientId: initialData?.clientId || preselectedClientId || (clients[0]?.id ?? ''),
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (raw.length <= 7) {
      setFormData((prev) => ({ ...prev, plate: raw }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isEditing && initialData) {
        const res = await updateVehicle(initialData.id, formData);
        if (!res.success) {
          toast.error(res.error || 'Erro ao atualizar veículo.');
          if (res.error?.toLowerCase().includes('placa')) {
            setErrors({ plate: res.error });
          }
        } else {
          toast.success('Veículo atualizado com sucesso!');
          router.push(`/veiculos/${initialData.id}`);
          router.refresh();
        }
      } else {
        const res = await createVehicle(formData);
        if (!res.success) {
          toast.error(res.error || 'Erro ao cadastrar veículo.');
          if (res.error?.toLowerCase().includes('placa')) {
            setErrors({ plate: res.error });
          }
        } else {
          toast.success('Veículo cadastrado com sucesso!');
          router.push('/veiculos');
          router.refresh();
        }
      }
    } catch {
      toast.error('Erro ao salvar veículo no banco de dados.');
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
            href={isEditing ? `/veiculos/${initialData.id}` : '/veiculos'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {formData.type === 'CARRO' ? (
                <Car className="w-5 h-5 text-blue-400" />
              ) : (
                <Bike className="w-5 h-5 text-emerald-400" />
              )}
              <span>{isEditing ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Informe os dados do automóvel ou motocicleta para acompanhamento de serviços.
            </p>
          </div>
        </div>
      </div>

      {/* Tipo de Veículo Toggle */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Categoria do Veículo <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'CARRO' })}
            className={`p-3.5 rounded-xl border flex items-center justify-center gap-3 transition-all cursor-pointer ${
              formData.type === 'CARRO'
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className={`w-5 h-5 ${formData.type === 'CARRO' ? 'text-blue-400' : ''}`} />
            <div className="text-left">
              <div className="text-sm font-bold">Carro / Automóvel</div>
              <div className="text-[10px] text-slate-400">Sedan, Hatch, SUV, Picape</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'MOTO' })}
            className={`p-3.5 rounded-xl border flex items-center justify-center gap-3 transition-all cursor-pointer ${
              formData.type === 'MOTO'
                ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bike className={`w-5 h-5 ${formData.type === 'MOTO' ? 'text-emerald-400' : ''}`} />
            <div className="text-left">
              <div className="text-sm font-bold">Moto / Motocicleta</div>
              <div className="text-[10px] text-slate-400">Street, Trail, Custom, Scooter</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        {/* Cliente Proprietário */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Cliente Proprietário <span className="text-red-400">*</span>
          </label>
          <select
            required
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="" disabled>
              Selecione o cliente...
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (CPF: {c.cpf})
              </option>
            ))}
          </select>
          {clients.length === 0 && (
            <p className="text-xs text-amber-400 mt-1">
              Nenhum cliente cadastrado. Cadastre um cliente primeiro antes de adicionar veículos.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Marca */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Marca / Fabricante <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder={formData.type === 'CARRO' ? 'Ex: Honda, Toyota, VW' : 'Ex: Honda, Yamaha, BMW'}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Modelo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder={formData.type === 'CARRO' ? 'Ex: Civic 2.0 EXL' : 'Ex: CG 160 Titan'}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Placa */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Placa do Veículo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.plate}
              onChange={handlePlateChange}
              placeholder="Ex: BRA2E19 ou ABC1234"
              maxLength={7}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono tracking-wider transition-colors"
            />
            {errors.plate && <p className="text-xs text-red-400 mt-1">{errors.plate}</p>}
          </div>

          {/* Ano */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ano de Fabricação / Modelo <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              required
              min={1950}
              max={new Date().getFullYear() + 2}
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Quilometragem Atual */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              <span>Quilometragem Atual (Km) <span className="text-red-400">*</span></span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
              placeholder="Ex: 85000"
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Cor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cor do Veículo (Opcional)
            </label>
            <input
              type="text"
              value={formData.color || ''}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Ex: Prata Platinum, Preto, Vermelho"
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Chassi */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Número do Chassi / VIN (Opcional)
            </label>
            <input
              type="text"
              value={formData.chassis || ''}
              onChange={(e) => setFormData({ ...formData, chassis: e.target.value.toUpperCase() })}
              placeholder="Ex: 93HFC1640LZ123456"
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono transition-colors"
            />
          </div>

          {/* Observações */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observações Gerais do Veículo
            </label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalhes sobre estado geral, histórico prévio, pneus, acessórios instalados, etc."
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            href={isEditing ? `/veiculos/${initialData.id}` : '/veiculos'}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || clients.length === 0}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Salvar Alterações' : 'Cadastrar Veículo'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
