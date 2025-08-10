'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../clientes/components/ui/input';
import { Button } from '../clientes/components/ui/button';
import { ContaCard } from './components/conta-card';
import { ContaForm, Conta } from './components/conta-form';

type ViewMode = '' | 'lista' | 'formulario';

const criarContaVazia = (): Conta => ({
  id: 0,
  dataPagamento: '',
  cliente: '',
  descricao: '',
  categoria: 'Serviço',
  tipo: 'A pagar',
  valor: '',
  pago: false,
  observacoes: '',
  temServico: false,
  servicoVinculado: '',
});

export default function Contas() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>(''); // estado inicial vazio - não mostra nada
  const [contas, setContas] = useState<Conta[]>([]);
  const [contaAtual, setContaAtual] = useState<Conta>(criarContaVazia());
  const [filtro, setFiltro] = useState('');

  function salvarConta() {
    if (!contaAtual.descricao.trim()) {
      alert('A descrição da conta é obrigatória.');
      return;
    }
    if (!contaAtual.cliente.trim()) {
      alert('O nome do cliente é obrigatório.');
      return;
    }
    if (contaAtual.valor && Number(contaAtual.valor) < 0) {
      alert('O valor não pode ser negativo.');
      return;
    }
    if (!contaAtual.dataPagamento) {
      alert('A data de pagamento é obrigatória.');
      return;
    }
    if (contaAtual.temServico && !contaAtual.servicoVinculado.trim()) {
      alert('Você selecionou que tem serviço, então vincule o serviço.');
      return;
    }

    setContas((prev) => {
      if (contaAtual.id === 0) {
        return [...prev, { ...contaAtual, id: Date.now() }];
      } else {
        return prev.map((c) => (c.id === contaAtual.id ? contaAtual : c));
      }
    });

    alert('Conta salva com sucesso!');
    setContaAtual(criarContaVazia());
    setViewMode('lista');
  }

  const deletarConta = (id: number) => {
    if (confirm('Deseja realmente excluir esta conta?')) {
      setContas((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleChange = <K extends keyof Conta>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: K
  ) => {
    let value: string | boolean =
      e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;

    if (field === 'valor' && typeof value === 'string') {
      value = value.replace(',', '.');
    }

    setContaAtual((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const limparFormulario = () => {
    setContaAtual(criarContaVazia());
    setViewMode('');
  };

  const contasFiltradas = contas.filter((c) =>
    [c.cliente, c.descricao, c.valor, c.categoria]
      .some((campo) => campo.toLowerCase().includes(filtro.toLowerCase()))
  );

  const formatarValor = (valor: string) => {
    const num = Number(valor.replace(',', '.'));
    if (isNaN(num)) return valor;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalPagar = contas
    .filter((c) => c.tipo === 'A pagar' && !c.pago)
    .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);
  const totalReceber = contas
    .filter((c) => c.tipo === 'A receber' && !c.pago)
    .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);
  const totalPago = contas.filter((c) => c.pago).reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

  const inputClass =
    'bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 caret-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-4 mb-4">
          <Button onClick={() => setViewMode('lista')} className="bg-blue-600 hover:bg-blue-700">
            Ver Contas
          </Button>
          <Button
            onClick={() => {
              setContaAtual(criarContaVazia());
              setViewMode('formulario');
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Cadastrar Conta
          </Button>
          <Button
            variant="outline"
            className="border border-gray-500 text-gray-200 hover:bg-gray-700"
            onClick={() => router.push('/')}
          >
            ← Voltar para Início
          </Button>
        </div>

        {viewMode === 'lista' && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-6">
              <Input
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar cliente, descrição, valor ou categoria..."
                className={`${inputClass} max-w-sm`}
              />
              <div className="space-x-4 text-gray-300">
                <span>
                  <strong>Total a pagar:</strong>{' '}
                  {totalPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <span>
                  <strong>Total a receber:</strong>{' '}
                  {totalReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <span>
                  <strong>Total pago:</strong>{' '}
                  {totalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <p className="mb-4 text-gray-300">Contas encontradas: {contasFiltradas.length}</p>

            {contasFiltradas.length === 0 ? (
              <p className="text-gray-400">Nenhuma conta encontrada.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {contasFiltradas.map((c) => (
                  <ContaCard
                    key={c.id}
                    conta={c}
                    formatarValor={formatarValor}
                    onEditar={(conta) => {
                      setContaAtual({
                        ...criarContaVazia(),
                        ...conta,
                        temServico: conta.temServico ?? false,
                        servicoVinculado: conta.servicoVinculado || '',
                        dataPagamento: conta.dataPagamento || '',
                      });
                      setViewMode('formulario');
                    }}
                    onExcluir={deletarConta}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {viewMode === 'formulario' && (
          <ContaForm
            conta={contaAtual}
            inputClass={inputClass}
            onChange={handleChange}
            onTogglePago={(checked) => setContaAtual((prev) => ({ ...prev, pago: checked }))}
            onToggleTemServico={(checked) => setContaAtual((prev) => ({ ...prev, temServico: checked }))}
            onCancelar={limparFormulario}
            onSalvar={salvarConta}
          />
        )}

        {/* Se viewMode vazio, não mostra nada */}
      </div>
    </div>
  );
}
