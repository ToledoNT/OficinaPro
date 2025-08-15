'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../clientes/components/ui/input';
import { Button } from '../clientes/components/ui/button';
import { ContaCard } from './components/conta-card';
import { ContaForm } from './components/conta-form';
import { useClientes, useContas, useServicosPorCliente } from './hook/conta-hook';
import { Conta } from '@/app/interfaces/contas-interface';

type ViewMode = '' | 'lista' | 'formulario' | 'visualizar';

export default function Contas() {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>('');
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
  const { contas, fetchContas, loadingContas, salvarConta, deletarConta } = useContas();
  const { servicos: servicosDoCliente, loading: loadingServicos } = useServicosPorCliente();

  const visualizarConta = (conta: Conta) => {
    // Busca o cliente pelo clienteId na lista de clientes
    let nomeCliente = conta.clienteNome;
    if ((!nomeCliente || nomeCliente === '') && conta.clienteId && clientes.length > 0) {
      const clienteEncontrado = clientes.find(c => c.id === conta.clienteId);
      nomeCliente = clienteEncontrado ? clienteEncontrado.nome : conta.cliente;
    }
  
    setContaAtual({
      ...conta,
      clienteNome: nomeCliente || conta.cliente, // fallback
    });
    setViewMode('visualizar');
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
    setContaAtual((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeValue = <K extends keyof Conta>(field: K, value: Conta[K]) => {
    setContaAtual((prev) => ({ ...prev, [field]: value }));
  };

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
    setViewMode('');
  };

  const contasFiltradas = contas.filter((c) => {
    const textoMatch = [c.cliente, c.descricao, c.valor, c.categoria]
      .some((campo) => campo?.toLowerCase().includes(filtro.toLowerCase()));

    let statusMatch = true;
    if (statusFiltro === 'pagas') statusMatch = c.pago === true;
    else if (statusFiltro === 'naoPagas') statusMatch = c.pago === false;

    return textoMatch && statusMatch;
  });

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
  const totalPago = contas
    .filter((c) => c.pago)
    .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

  const onSalvarConta = async () => {
    const resultado = await salvarConta(contaAtual);
    if (resultado.success) {
      alert('Conta salva com sucesso!');
      limparFormulario();
      setViewMode('lista');
    } else {
      alert('Erro ao salvar conta: ' + (resultado.message ?? ''));
    }
  };

  const inputClass =
    'bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 caret-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Botões principais */}
        <div className="flex flex-wrap gap-4 mb-4">
          <Button
            onClick={async () => {
              await fetchContas();
              setViewMode('lista');
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
            ← Voltar para Início
          </Button>
        </div>

        {/* Lista */}
        {viewMode === 'lista' && (
          <>
            {loadingContas ? (
              <p>Carregando contas...</p>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-6">
                  <Input
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    placeholder="Buscar cliente, descrição, valor ou categoria..."
                    className={`${inputClass} max-w-sm`}
                  />
                  <select
                    className={`${inputClass} py-2 px-3 rounded max-w-xs`}
                    value={statusFiltro}
                    onChange={(e) =>
                      setStatusFiltro(e.target.value as 'todos' | 'pagas' | 'naoPagas')
                    }
                  >
                    <option value="todos">Todos</option>
                    <option value="pagas">Pagas</option>
                    <option value="naoPagas">Não Pagas</option>
                  </select>
                  <div className="space-x-4 text-gray-300">
                    <span>
                      <strong>Total a pagar:</strong>{' '}
                      {totalPagar.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                    <span>
                      <strong>Total a receber:</strong>{' '}
                      {totalReceber.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
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
                        key={c.id ?? Math.random()}
                        conta={c}
                        formatarValor={formatarValor}
                        onVer={() => visualizarConta(c)}
                        onEditar={() => {
                          setContaAtual(c);
                          setViewMode('formulario');
                        }}
                        onExcluir={() => c.id && deletarConta(c.id)}
                        loading={false}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Formulário */}
        {viewMode === 'formulario' && (
          <>
            {loadingClientes || loadingServicos ? (
              <p>Carregando dados...</p>
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
                onTogglePago={(checked) => setContaAtual((prev) => ({ ...prev, pago: checked }))}
                onToggleTemServico={(checked) =>
                  setContaAtual((prev) => ({ ...prev, temServico: checked }))
                }
                onCancelar={limparFormulario}
                onSalvar={onSalvarConta}
              />
            )}
          </>
        )}

        {/* Visualizar */}
        {viewMode === 'visualizar' && (
          <div className="bg-[#1e293b] border border-gray-700 rounded-md p-4 space-y-2 text-sm max-w-4xl mx-auto">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p>
                  <strong>Cliente:</strong> {contaAtual.clienteNome || '-'}
                </p>
                <p>
                  <strong>Categoria:</strong> {contaAtual.categoria || '-'}
                </p>
                <p>
                  <strong>Tipo:</strong> {contaAtual.tipo || '-'}
                </p>
                <p>
                  <strong>Valor:</strong> {formatarValor(contaAtual.valor)}
                </p>
                <p>
                  <strong>Pago:</strong> {contaAtual.pago ? 'Sim' : 'Não'}
                </p>
                <p>
                  <strong>Data de Pagamento:</strong> {contaAtual.dataPagamento || '-'}
                </p>
              </div>
            </div>

            <p>
              <strong>Descrição:</strong> {contaAtual.descricao || '-'}
            </p>
            {contaAtual.observacoes && (
              <p>
                <strong>Observações:</strong> {contaAtual.observacoes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
