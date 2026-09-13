'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient, updateClient } from '@/app/actions/clients';
import { ClientFormData } from '@/lib/validations/client';

interface ClientFormProps {
  initialData?: {
    id: string;
    name: string;
    cpf: string | null;
    phone: string;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
  };
}

export default function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<ClientFormData>({
    name: initialData?.name || '',
    cpf: initialData?.cpf || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    notes: initialData?.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mask handlers
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 9) {
      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (v.length > 6) {
      v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (v.length > 3) {
      v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setFormData((prev) => ({ ...prev, cpf: v }));
    if (errors.cpf) setErrors((prev) => ({ ...prev, cpf: '' }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 10) {
      v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (v.length > 6) {
      v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    setFormData((prev) => ({ ...prev, phone: v }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isEditing && initialData) {
        const res = await updateClient(initialData.id, formData);
        if (!res.success) {
          toast.error(res.error || 'Erro ao atualizar cliente.');
          if (res.error?.toLowerCase().includes('cpf')) {
            setErrors({ cpf: res.error });
          }
        } else {
          toast.success('Cliente atualizado com sucesso!');
          router.push(`/clientes/${initialData.id}`);
          router.refresh();
        }
      } else {
        const res = await createClient(formData);
        if (!res.success) {
          toast.error(res.error || 'Erro ao cadastrar cliente.');
          if (res.error?.toLowerCase().includes('cpf')) {
            setErrors({ cpf: res.error });
          }
        } else {
          toast.success('Cliente cadastrado com sucesso!');
          router.push('/clientes');
          router.refresh();
        }
      }
    } catch {
      toast.error('Erro de comunicação com o servidor.');
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
            href={isEditing ? `/clientes/${initialData.id}` : '/clientes'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>{isEditing ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditing
                ? 'Atualize as informações de contato e cadastro do cliente.'
                : 'Preencha os dados do proprietário do veículo.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nome Completo */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nome Completo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: João da Silva Santos"
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* CPF */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              CPF (Opcional)
            </label>
            <input
              type="text"
              value={formData.cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00 (Opcional)"
              maxLength={14}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono transition-colors"
            />
            {errors.cpf && <p className="text-xs text-red-400 mt-1">{errors.cpf}</p>}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Telefone / WhatsApp <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="(11) 99999-9999"
              maxLength={15}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
          </div>

          {/* E-mail */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail (Opcional)
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="cliente@exemplo.com"
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>

          {/* Endereço */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Endereço Completo (Opcional)
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Rua, número, bairro, cidade - UF"
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Observações */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observações Internas (Opcional)
            </label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas importantes sobre o cliente, preferências, condições de pagamento, etc."
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            href={isEditing ? `/clientes/${initialData.id}` : '/clientes'}
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
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}