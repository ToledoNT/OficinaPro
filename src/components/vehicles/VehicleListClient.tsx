'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  Bike,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Users,
  Gauge,
  Calendar,
  AlertTriangle,
  Loader2,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteVehicle } from '@/app/actions/vehicles';
import { formatPlate, formatKm } from '@/lib/utils';
import { VehicleType } from '@prisma/client';

interface VehicleItem {
  id: string;
  type: VehicleType;
  brand: string | null;
  model: string | null;
  year: number | null;
  plate: string | null;
  mileage: number;
  color: string | null;
  chassis: string | null;
  client: {
    id: string;
    name: string;
    phone: string;
  };
  _count: {
    history: number;
    budgets: number;
  };
}


export default function VehicleListClient({
  initialVehicles,
}: {
  initialVehicles: VehicleItem[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALL' | 'CARRO' | 'MOTO'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Counts
  const totalCars = initialVehicles.filter((v) => v.type === 'CARRO').length;
  const totalMotos = initialVehicles.filter((v) => v.type === 'MOTO').length;

  // Filter
  const filtered = initialVehicles.filter((v) => {
    if (activeTab !== 'ALL' && v.type !== activeTab) return false;

    const term = searchTerm.toLowerCase();
    const plateClean = (v.plate ?? '').toLowerCase();
    const modelMatch = `${v.brand ?? ''} ${v.model ?? ''}`.toLowerCase().includes(term);
    const clientMatch = v.client.name.toLowerCase().includes(term);
    const plateMatch = plateClean.includes(term.replace(/[^a-z0-9]/g, ''));

    return modelMatch || clientMatch || plateMatch;

  });

  const handleDelete = async () => {
    if (!vehicleToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteVehicle(vehicleToDelete.id);
      if (!res.success) {
        toast.error(res.error || 'Erro ao excluir veículo.');
      } else {
        toast.success(
          `Veículo ${vehicleToDelete.brand} ${vehicleToDelete.model} (${formatPlate(
            vehicleToDelete.plate
          )}) excluído.`
        );
        setVehicleToDelete(null);
        router.refresh();
      }
    } catch {
      toast.error('Ocorreu um erro ao excluir o veículo.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Car className="w-6 h-6 text-blue-400" />
              <Bike className="w-6 h-6 text-emerald-400" />
            </div>
            <span>Veículos</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {filtered.length} {filtered.length === 1 ? 'veículo' : 'veículos'}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestão completa de carros e motos com odômetro e histórico vinculado.
          </p>
        </div>

        <Link
          href="/veiculos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Veículo</span>
        </Link>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800/80">
              {initialVehicles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CARRO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CARRO'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-blue-400" />
            <span>Carros</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800/80">
              {totalCars}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MOTO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'MOTO'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-emerald-400" />
            <span>Motos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800/80">
              {totalMotos}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa, modelo ou dono..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Vehicle List Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Nenhum veículo encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'Tente ajustar sua busca por placa ou modelo.'
              : 'Cadastre o primeiro veículo vinculado a um cliente da oficina.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4">Marca & Modelo</th>
                  <th className="py-3.5 px-4">Placa</th>
                  <th className="py-3.5 px-4">Km Atual</th>
                  <th className="py-3.5 px-4">Cliente Proprietário</th>
                  <th className="py-3.5 px-4">Histórico</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      {v.type === 'CARRO' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Car className="w-3 h-3" /> Carro
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Bike className="w-3 h-3" /> Moto
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/veiculos/${v.id}`}
                        className="font-bold text-white hover:text-blue-400 hover:underline block"
                      >
                        {v.brand} {v.model}
                      </Link>
                      <span className="text-[11px] text-slate-500">
                        Ano {v.year} {v.color ? `• ${v.color}` : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block font-mono font-bold text-xs bg-slate-950 text-white px-2 py-0.5 rounded border border-slate-700 tracking-wider">
                        {formatPlate(v.plate)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {formatKm(v.mileage)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/clientes/${v.client.id}`}
                        className="text-blue-400 hover:underline font-medium"
                      >
                        {v.client.name}
                      </Link>
                      <div className="text-[11px] text-slate-500">{v.client.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        <Wrench className="w-3 h-3 text-amber-400" />
                        {v._count.history} {v._count.history === 1 ? 'serviço' : 'serviços'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/veiculos/${v.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                          title="Ver linha do tempo e histórico"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/veiculos/${v.id}/editar`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition-colors"
                          title="Editar dados do veículo"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setVehicleToDelete(v)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Excluir veículo"
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

      {/* Delete Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Excluir Veículo</h3>
                <p className="text-xs text-slate-400">Confirmar remoção de registro.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja excluir o veículo{' '}
              <strong className="text-white font-semibold">
                {vehicleToDelete.brand} {vehicleToDelete.model} (Placa:{' '}
                {formatPlate(vehicleToDelete.plate)})
              </strong>
              ?
            </p>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px]">
              Veículos com serviços realizados no histórico não poderão ser excluídos para manter a
              garantia e relatórios técnicos.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setVehicleToDelete(null)}
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
