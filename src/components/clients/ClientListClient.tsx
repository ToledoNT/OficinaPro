'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Car,
  Bike,
  Phone,
  Mail,
  AlertTriangle,
  Loader2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteClient } from '@/app/actions/clients';
import { formatCPF, formatPhone, formatDate } from '@/lib/utils';

interface ClientItem {
  id: string;
  name: string;
  cpf: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  createdAt: Date;
  vehicles: {
    id: string;
    type: 'CARRO' | 'MOTO';
    brand: string | null;
    model: string | null;
    plate: string | null;
  }[];
  _count: {
    budgets: number;
  };
}

export default function ClientListClient({
  initialClients,
}: {
  initialClients: ClientItem[];
}) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [clientToDelete, setClientToDelete] = useState<ClientItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = initialClients.filter((client) => {
    const term = searchTerm.toLowerCase();
    const numericTerm = term.replace(/\D/g, '');

    const nameMatch = client.name.toLowerCase().includes(term);

    const cpfMatch = (client.cpf ?? '')
      .replace(/\D/g, '')
      .includes(numericTerm);

    const phoneMatch = client.phone
      .replace(/\D/g, '')
      .includes(numericTerm);

    return nameMatch || cpfMatch || phoneMatch;
  });

  const handleDelete = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);

    try {
      const res = await deleteClient(clientToDelete.id);

      if (!res.success) {
        toast.error(res.error || 'Erro ao excluir cliente.');
      } else {
        toast.success(`Cliente "${clientToDelete.name}" excluído.`);
        setClientToDelete(null);
        router.refresh();
      }
    } catch {
      toast.error('Ocorreu um erro ao tentar excluir o cliente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Clientes</span>

            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {filtered.length}{' '}
              {filtered.length === 1 ? 'cadastrado' : 'cadastrados'}
            </span>
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Gerenciamento de clientes proprietários de carros e motos.
          </p>
        </div>

        <Link
          href="/clientes/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CPF ou telefone..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
          >
            Limpar busca
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />

          <h3 className="text-base font-semibold text-slate-300">
            Nenhum cliente encontrado
          </h3>

          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'Tente ajustar os termos da sua pesquisa para encontrar o cliente desejado.'
              : 'Comece adicionando seu primeiro cliente ao sistema para gerenciar veículos e serviços.'}
          </p>

          {!searchTerm && (
            <Link
              href="/clientes/novo"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Cliente</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-4">Nome Completo</th>
                  <th className="py-3.5 px-4">CPF</th>
                  <th className="py-3.5 px-4">Telefone & E-mail</th>
                  <th className="py-3.5 px-4">Veículos</th>
                  <th className="py-3.5 px-4">Orçamentos</th>
                  <th className="py-3.5 px-4">Data Cadastro</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((client) => {
                  const cars = client.vehicles.filter(
                    (v) => v.type === 'CARRO'
                  ).length;

                  const motos = client.vehicles.filter(
                    (v) => v.type === 'MOTO'
                  ).length;

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/clientes/${client.id}`}
                          className="font-semibold text-white hover:text-blue-400 hover:underline flex items-center gap-1.5"
                        >
                          {client.name}
                        </Link>

                        {client.address && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                            {client.address}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {formatCPF(client.cpf)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{formatPhone(client.phone)}</span>
                        </div>

                        {client.email && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[160px]">
                              {client.email}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {client.vehicles.length === 0 ? (
                          <span className="text-slate-500 italic">
                            Sem veículos
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {cars > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <Car className="w-3 h-3" />
                                {cars}
                              </span>
                            )}

                            {motos > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Bike className="w-3 h-3" />
                                {motos}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <FileText className="w-3 h-3" />
                          {client._count.budgets}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {formatDate(client.createdAt)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/clientes/${client.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                            title="Ver detalhes do cliente"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/clientes/${client.id}/editar`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition-colors"
                            title="Editar cliente"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setClientToDelete(client)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Excluir cliente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Excluir Cliente
                </h3>

                <p className="text-xs text-slate-400">
                  Esta ação requer atenção.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Você tem certeza que deseja excluir o cliente{' '}
              <strong className="text-white font-semibold">
                {clientToDelete.name}
              </strong>{' '}
              (CPF: {formatCPF(clientToDelete.cpf)})?
            </p>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] leading-relaxed">
              <strong>Atenção:</strong> Se este cliente possuir veículos com
              históricos de serviços ou manutenções realizadas, a exclusão será
              bloqueada para preservar o histórico de garantia.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
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