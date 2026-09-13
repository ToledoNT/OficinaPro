'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  Car,
  Bike,
  Wrench,
  Package,
  DollarSign,
  Percent,
} from 'lucide-react';
import { toast } from 'sonner';
import { createBudget, updateBudget } from '@/app/actions/budgets';
import { formatCurrency, formatPlate } from '@/lib/utils';
import { BudgetStatus, ItemType, VehicleType } from '@prisma/client';

interface ClientOption {
  id: string;
  name: string;
  cpf: string | null;
}

interface VehicleOption {
  id: string;
  brand: string | null;
  model: string | null;
  plate: string | null;
  type: VehicleType;
  clientId: string;
}


interface BudgetItemRow {
  id?: string;
  type: ItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

interface BudgetFormProps {
  initialData?: {
    id: string;
    clientId: string;
    vehicleId: string;
    date: Date;
    expirationDate: Date;
    status: BudgetStatus;
    notes?: string | null;
    discount?: any;
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
  clients: ClientOption[];
  vehicles: VehicleOption[];
  preselectedClientId?: string;
  preselectedVehicleId?: string;
}

export default function BudgetForm({
  initialData,
  clients,
  vehicles,
  preselectedClientId,
  preselectedVehicleId,
}: BudgetFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  // Selected client
  const [clientId, setClientId] = useState<string>(
    initialData?.clientId || preselectedClientId || (clients[0]?.id ?? '')
  );

  // Available vehicles for chosen client
  const clientVehicles = useMemo(() => {
    return vehicles.filter((v) => v.clientId === clientId);
  }, [vehicles, clientId]);

  // Selected vehicle
  const [vehicleId, setVehicleId] = useState<string>(
    initialData?.vehicleId ||
      preselectedVehicleId ||
      (clientVehicles[0]?.id ?? '')
  );

  // Update vehicle selection if client changes
  useEffect(() => {
    if (!clientVehicles.some((v) => v.id === vehicleId)) {
      setVehicleId(clientVehicles[0]?.id ?? '');
    }
  }, [clientId, clientVehicles, vehicleId]);

  // Dates
  const todayStr = new Date().toISOString().split('T')[0];
  const in15Days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [date, setDate] = useState<string>(
    initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : todayStr
  );

  const [expirationDate, setExpirationDate] = useState<string>(
    initialData?.expirationDate
      ? new Date(initialData.expirationDate).toISOString().split('T')[0]
      : in15Days
  );

  const [status, setStatus] = useState<BudgetStatus>(
    initialData?.status || 'RASCUNHO'
  );

  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [globalDiscount, setGlobalDiscount] = useState<number>(
    initialData ? Number(initialData.discount || 0) : 0
  );

  // Items
  const [items, setItems] = useState<BudgetItemRow[]>(
    initialData
      ? initialData.items.map((item) => ({
          id: item.id,
          type: item.type,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount || 0),
          subtotal: Number(item.subtotal),
        }))
      : [
          {
            type: 'SERVICO',
            description: 'Mão de obra diagnóstico e revisão',
            quantity: 1,
            unitPrice: 150,
            discount: 0,
            subtotal: 150,
          },
        ]
  );

  const [loading, setLoading] = useState(false);

  // Handle item change
  const handleItemChange = (
    index: number,
    field: keyof BudgetItemRow,
    val: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: val };

      // Recalcular subtotal da linha
      const qty = field === 'quantity' ? Number(val) : item.quantity;
      const price = field === 'unitPrice' ? Number(val) : item.unitPrice;
      const disc = field === 'discount' ? Number(val) : item.discount;

      item.subtotal = Math.max(0, qty * price - disc);
      updated[index] = item;
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        type: 'PECA',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        subtotal: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('O orçamento precisa de pelo menos 1 item.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const itemsSubtotal = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.subtotal, 0);
  }, [items]);

  const finalTotal = useMemo(() => {
    return Math.max(0, itemsSubtotal - globalDiscount);
  }, [itemsSubtotal, globalDiscount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast.error('Selecione um cliente.');
      return;
    }

    if (!vehicleId) {
      toast.error('Selecione um veículo para este cliente.');
      return;
    }

    if (items.length === 0) {
      toast.error('Adicione ao menos um item ao orçamento.');
      return;
    }

    // Validar descrições preenchidas
    for (let i = 0; i < items.length; i++) {
      if (!items[i].description.trim()) {
        toast.error(`Preencha a descrição do item #${i + 1}.`);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        clientId,
        vehicleId,
        date,
        expirationDate,
        status,
        notes,
        subtotal: itemsSubtotal,
        discount: globalDiscount,
        totalAmount: finalTotal,
        items,
      };

      if (isEditing && initialData) {
        const res = await updateBudget(initialData.id, payload);
        if (!res.success) {
          toast.error(res.error || 'Erro ao atualizar orçamento.');
        } else {
          toast.success('Orçamento atualizado com sucesso!');
          router.push(`/orcamentos/${initialData.id}`);
          router.refresh();
        }
      } else {
        const res = await createBudget(payload);
        if (!res.success) {
          toast.error(res.error || 'Erro ao gerar orçamento.');
        } else {
          toast.success('Orçamento criado com sucesso!');
          router.push(`/orcamentos/${res.budget?.id}`);
          router.refresh();
        }
      }
    } catch {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href={isEditing ? `/orcamentos/${initialData.id}` : '/orcamentos'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span>{isEditing ? 'Editar Orçamento' : 'Novo Orçamento de Oficina'}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Defina os serviços, peças e insumos com cálculo automático de subtotais e descontos.
            </p>
          </div>
        </div>
      </div>

      {/* Identificação: Cliente, Veículo e Prazos */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          1. Dados Gerais do Orçamento
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cliente */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cliente Proprietário <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
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
          </div>

          {/* Veículo */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Veículo Atendido <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              disabled={clientVehicles.length === 0}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
            >
              <option value="" disabled>
                {clientVehicles.length === 0
                  ? 'Este cliente não possui veículos cadastrados'
                  : 'Selecione o veículo...'}
              </option>
              {clientVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.type === 'CARRO' ? 'CARRO' : 'MOTO'}] {v.brand} {v.model} - Placa:{' '}
                  {formatPlate(v.plate)}
                </option>
              ))}
            </select>
          </div>

          {/* Data Emissão */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data de Emissão <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Data Validade */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data de Validade <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              required
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status Inicial */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status do Orçamento <span className="text-red-400">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BudgetStatus)}
              className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="RASCUNHO">Rascunho (Em elaboração)</option>
              <option value="ENVIADO">Enviado (Aguardando cliente)</option>
              <option value="APROVADO">Aprovado (Pronto para execução)</option>
              <option value="RECUSADO">Recusado pelo cliente</option>
              <option value="EXPIRADO">Expirado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Itens do Orçamento: Serviços e Peças */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              2. Itens, Serviços e Peças
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Adicione os serviços de mão de obra e as peças que serão aplicadas no veículo.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Item</span>
          </button>
        </div>

        {/* Table of Dynamic Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-2 w-32">Tipo</th>
                <th className="py-2.5 px-2">Descrição do Serviço / Peça</th>
                <th className="py-2.5 px-2 w-20 text-center">Qtd</th>
                <th className="py-2.5 px-2 w-28 text-right">Valor Unit. (R$)</th>
                <th className="py-2.5 px-2 w-24 text-right">Desconto (R$)</th>
                <th className="py-2.5 px-2 w-28 text-right">Subtotal (R$)</th>
                <th className="py-2.5 px-2 w-12 text-center">Remover</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-slate-800/30">
                  {/* Tipo */}
                  <td className="py-2 px-2">
                    <select
                      value={item.type}
                      onChange={(e) =>
                        handleItemChange(index, 'type', e.target.value as ItemType)
                      }
                      className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="SERVICO">Serviço</option>
                      <option value="PECA">Peça</option>
                    </select>
                  </td>

                  {/* Descrição */}
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, 'description', e.target.value)
                      }
                      placeholder={
                        item.type === 'SERVICO'
                          ? 'Ex: Troca de pastilhas de freio'
                          : 'Ex: Jogo de pastilhas Fras-le'
                      }
                      className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </td>

                  {/* Quantidade */}
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', e.target.value)
                      }
                      className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white text-center focus:outline-none focus:border-blue-500"
                    />
                  </td>

                  {/* Valor Unitário */}
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(index, 'unitPrice', e.target.value)
                      }
                      className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white text-right font-mono focus:outline-none focus:border-blue-500"
                    />
                  </td>

                  {/* Desconto */}
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.discount}
                      onChange={(e) =>
                        handleItemChange(index, 'discount', e.target.value)
                      }
                      className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white text-right font-mono focus:outline-none focus:border-blue-500"
                    />
                  </td>

                  {/* Subtotal Calculado */}
                  <td className="py-2 px-2 text-right font-mono font-bold text-slate-100 whitespace-nowrap">
                    {formatCurrency(item.subtotal)}
                  </td>

                  {/* Botão Remover */}
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remover linha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Global Calculations and Totals */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row justify-end items-end gap-4">
          <div className="w-full sm:w-72 space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Subtotal dos Itens:</span>
              <span className="font-mono font-semibold text-slate-200">
                {formatCurrency(itemsSubtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3 text-amber-400" />
                Desconto Adicional (R$):
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={globalDiscount}
                onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                className="w-24 py-1 px-2 bg-slate-900 border border-slate-700 rounded text-right font-mono text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-bold">
              <span className="text-white">Valor Total:</span>
              <span className="text-emerald-400 font-mono text-base font-black">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Observações e Condições Gerais do Orçamento
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Condições de pagamento (ex: em até 3x no cartão sem juros), prazo estimado de entrega, garantia das peças e serviços, etc."
          className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Footer Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href={isEditing ? `/orcamentos/${initialData.id}` : '/orcamentos'}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading || !clientId || !vehicleId}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gerando Orçamento...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Atualizar Orçamento' : 'Salvar e Gerar Orçamento'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
