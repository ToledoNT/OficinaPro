'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../clientes/components/ui/input';
import { Button } from '../clientes/components/ui/button';
import { ContaCard } from './components/conta-card';
import { ContaForm } from './components/conta-form';
import { useClientes, useContas, useServicosPorCliente } from './hook/conta-hook';
import { Conta } from '@/app/interfaces/contas-interface';

type ViewMode = 'lista' | 'formulario' | 'visualizar';

export default function Contas() {
  const router = useRouter();

  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.replace('/');
    } else {
      try {
        JSON.parse(storedUser);
        setLoadingSession(false);
      } catch {
        localStorage.removeItem('user');
        router.replace('/');
      }
    }
  }, [router]);

  const [viewMode, setViewMode] = useState<ViewMode>('lista');
  const [contaAtual, setContaAtual] = useState<Conta>({
    id: undefined,
    dataPagamento: '',
    cliente: '',
    clienteId: undefined,
    descricao: '',
    categoria: 'Serviço',
    tipo: 'A pagar',
    valor: '',
    pago: false,
    observacoes: '',
    temServico: false,
    servicoId: undefined,
    servicoVinculado: '',
    clienteNome: '',
  });

  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | 'pagas' | 'naoPagas'>('todos');

  const { clientes, loadingClientes, errorClientes } = useClientes();
  const { contas, fetchContas, salvarConta, deletarConta, loadingContas } = useContas();
  const { servicos: servicosDoCliente, loading: loadingServicos } = useServicosPorCliente();

  const inputClass =
    'bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 caret-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  const limparFormulario = () => {
    setContaAtual({
      id: undefined,
      dataPagamento: '',
      cliente: '',
      clienteId: undefined,
      descricao: '',
      categoria: 'Serviço',
      tipo: 'A pagar',
      valor: '',
      pago: false,
      observacoes: '',
      temServico: false,
      servicoId: undefined,
      servicoVinculado: '',
      clienteNome: '',
    });
    setViewMode('lista');
  };

  const handleChange = <K extends keyof Conta>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: K
  ) => {
    let value: string | boolean =
      e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    if (field === 'valor' && typeof value === 'string') value = value.replace(',', '.');
    setContaAtual(prev => ({ ...prev, [field]: value }));
  };

  const handleChangeValue = <K extends keyof Conta>(field: K, value: Conta[K]) => {
    setContaAtual(prev => ({ ...prev, [field]: value }));
  };

  const visualizarConta = (conta: Conta) => {
    let nomeCliente = conta.clienteNome;
    if ((!nomeCliente || nomeCliente === '') && conta.clienteId && clientes.length > 0) {
      const clienteEncontrado = clientes.find(c => c.id === conta.clienteId);
      nomeCliente = clienteEncontrado ? clienteEncontrado.nome : conta.cliente;
    }
    setContaAtual({ ...conta, clienteNome: nomeCliente || conta.cliente });
    setViewMode('visualizar');
  };

  const contasFiltradas = contas.filter(c => {
    const textoMatch = [c.cliente, c.descricao, c.valor, c.categoria].some(campo =>
      campo?.toString().toLowerCase().includes(filtro.toLowerCase())
    );

    let statusMatch = true;
    if (statusFiltro === 'pagas') statusMatch = c.pago === true;
    else if (statusFiltro === 'naoPagas') statusMatch = c.pago === false;

    return textoMatch && statusMatch;
  });

  const parseValor = (valor: string | number | undefined) => {
    if (!valor) return 0;
    const numero = typeof valor === 'number' ? valor : Number(valor.toString().replace(',', '.'));
    return isNaN(numero) ? 0 : numero;
  };

  const formatarValor = (valor: string | number | undefined) =>
    parseValor(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const totalPagar = contas
    .filter(c => c.tipo.toLowerCase() === 'a pagar' && !c.pago)
    .reduce((acc, cur) => acc + parseValor(cur.valor), 0);

  const totalReceber = contas
    .filter(c => c.tipo.toLowerCase() === 'a receber' && !c.pago)
    .reduce((acc, cur) => acc + parseValor(cur.valor), 0);

  const totalPago = contas.filter(c => c.pago).reduce((acc, cur) => acc + parseValor(cur.valor), 0);

  const onSalvarOuAtualizarConta = async (conta: Conta) => {
    const resultado = await salvarConta(conta);
    if (resultado.success) {
      alert(`Conta ${conta.id ? 'atualizada' : 'salva'} com sucesso!`);
      limparFormulario();
      await fetchContas();
    } else {
      alert('Erro ao salvar/atualizar conta: ' + (resultado.message ?? ''));
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Botões principais */}
        {viewMode === 'lista' && (
          <div className="flex flex-wrap gap-4 mb-4">
            <Button
              onClick={async () => {
                await fetchContas();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ver Contas
            </Button>
            <Button
              onClick={() => {
                limparFormulario();
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
              ← Voltar para tela inicial
            </Button>
          </div>
        )}

        {/* Lista */}
        {viewMode === 'lista' && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-6">
              <Input
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
                placeholder="Buscar cliente, descrição, valor ou categoria..."
                className={`${inputClass} max-w-sm`}
              />
              <select
                className={`${inputClass} py-2 px-3 rounded max-w-xs`}
                value={statusFiltro}
                onChange={e =>
                  setStatusFiltro(e.target.value as 'todos' | 'pagas' | 'naoPagas')
                }
              >
                <option value="todos">Todos</option>
                <option value="pagas">Pagas</option>
                <option value="naoPagas">Não Pagas</option>
              </select>
            </div>

            <div className="mb-4 space-x-4 text-gray-300">
              <span><strong>Total a pagar:</strong> {formatarValor(totalPagar)}</span>
              <span><strong>Total a receber:</strong> {formatarValor(totalReceber)}</span>
              <span><strong>Total pago:</strong> {formatarValor(totalPago)}</span>
            </div>

            {loadingContas ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400 border-b-4 border-gray-600"></div>
              </div>
            ) : contasFiltradas.length === 0 ? (
              <p className="text-gray-400">Nenhuma conta encontrada.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {contasFiltradas.map(c => (
                  <ContaCard
                    key={c.id ?? Math.random()}
                    conta={c}
                    formatarValor={formatarValor}
                    onVer={() => visualizarConta(c)}
                    onEditar={contaSelecionada => {
                      setContaAtual(contaSelecionada);
                      setViewMode('formulario');
                    }}
                    onExcluir={async () => {
                      if (!c.id) return;
                      const confirm = window.confirm('Tem certeza que deseja excluir esta conta?');
                      if (!confirm) return;
                      const resultado = await deletarConta(c.id);
                      if (resultado.success) {
                        alert('Conta excluída com sucesso!');
                        await fetchContas();
                      } else {
                        alert('Erro ao excluir conta: ' + (resultado.message ?? ''));
                      }
                    }}
                    loading={false}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Formulário */}
        {viewMode === 'formulario' && (
          <>
            <div className="mb-4">
              <Button variant="outline" onClick={limparFormulario}>
                ← Voltar
              </Button>
            </div>

            {loadingClientes || loadingServicos ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400 border-b-4 border-gray-600"></div>
              </div>
            ) : errorClientes ? (
              <p className="text-red-500">{errorClientes}</p>
            ) : (
              <ContaForm
                conta={contaAtual}
                clientes={clientes}
                servicos={servicosDoCliente}
                inputClass={inputClass}
                onChange={handleChange}
                onChangeValue={handleChangeValue}
                onTogglePago={checked => setContaAtual(prev => ({ ...prev, pago: checked }))}
                onToggleTemServico={checked => setContaAtual(prev => ({ ...prev, temServico: checked }))}
                onCancelar={limparFormulario}
                onSalvar={onSalvarOuAtualizarConta}
              />
            )}
          </>
        )}

        {/* Visualizar */}
        {viewMode === 'visualizar' && (
          <>
            <div className="mb-4">
              <Button variant="outline" onClick={() => setViewMode('lista')}>
                ← Voltar
              </Button>
            </div>
            <div className="bg-[#1e293b] border border-gray-700 rounded-md p-4 space-y-2 text-sm max-w-4xl mx-auto">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p><strong>Cliente:</strong> {contaAtual.clienteNome || '-'}</p>
                  <p><strong>Categoria:</strong> {contaAtual.categoria || '-'}</p>
                  <p><strong>Tipo:</strong> {contaAtual.tipo || '-'}</p>
                  <p><strong>Valor:</strong> {formatarValor(contaAtual.valor)}</p>
                  <p><strong>Pago:</strong> {contaAtual.pago ? 'Sim' : 'Não'}</p>
                  <p><strong>Data de Pagamento:</strong> {contaAtual.dataPagamento || '-'}</p>
                </div>
              </div>
              <p><strong>Descrição:</strong> {contaAtual.descricao || '-'}</p>
              {contaAtual.observacoes && <p><strong>Observações:</strong> {contaAtual.observacoes}</p>}
              {contaAtual.temServico && (
                <p>
                  <strong>Serviço vinculado:</strong> {contaAtual.servicoVinculado || `ID: ${contaAtual.servicoId}`}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}