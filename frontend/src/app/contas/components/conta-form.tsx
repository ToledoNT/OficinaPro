'use client';

import React, { useEffect, useState } from 'react';
import { Label } from '@/app/clientes/components/ui/label';
import { Input } from '@/app/clientes/components/ui/input';
import { Switch } from '@/app/clientes/components/ui/switch';
import { Textarea } from '@/app/clientes/components/ui/textarea';
import { Button } from '@/app/clientes/components/ui/button';
import { Card, CardContent } from '@/app/clientes/components/ui/card';
import { Cliente } from '@/app/interfaces/clientes-interface';
import { ContaFormProps } from '@/app/interfaces/contas-interface';
import { useClientes, useServicosPorCliente } from '../hook/conta-hook';

const categorias = [
  'Serviço', 'Peças', 'Material', 'Manutenção', 'Revisão',
  'Troca de óleo', 'Pneus', 'Outros',
];

export function ContaForm({
  conta,
  onChange,
  onChangeValue,
  onTogglePago,
  onToggleTemServico,
  onCancelar,
  onSalvar,
  readonly = false,
  loading = false, 
}: ContaFormProps & { loading?: boolean }) {
  const { clientes, fetchClientes } = useClientes();
  const { servicos, fetchServicos } = useServicosPorCliente();

  const [clienteBusca, setClienteBusca] = useState(conta.clienteNome || conta.cliente || '');
  const [clienteSugestoes, setClienteSugestoes] = useState<Cliente[]>([]);

  const inputClass =
    "bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full p-2 rounded";

  useEffect(() => {
    setClienteBusca(conta.clienteNome || conta.cliente || '');
  }, [conta]);

  useEffect(() => {
    if (!clientes || clientes.length === 0) return;

    const busca = clienteBusca.trim().toLowerCase();
    if (!busca) {
      setClienteSugestoes([]);
      return;
    }

    const resultados = clientes.filter(c =>
      c.nome.toLowerCase().includes(busca)
    );
    setClienteSugestoes(resultados);
  }, [clienteBusca, clientes]);

  const handleClienteBuscaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setClienteBusca(valor);
    onChangeValue('cliente', valor);

    const clienteEncontrado = clientes.find(
      c => c.nome.toLowerCase() === valor.trim().toLowerCase()
    );

    if (clienteEncontrado) {
      onChangeValue('clienteId', clienteEncontrado.id);
      fetchServicos(clienteEncontrado.id);
    } else {
      onChangeValue('clienteId', undefined);
    }
  };

  const selecionarCliente = (cliente: Cliente) => {
    onChangeValue('clienteId', cliente.id);
    onChangeValue('cliente', cliente.nome);
    setClienteBusca(cliente.nome);
    setClienteSugestoes([]);
    fetchServicos(cliente.id);
  };

  const handleClienteFocus = async () => {
    if (clientes.length === 0) await fetchClientes();
  };

  const handleSalvar = () => {
    if (!conta.clienteId) { alert('Selecione um cliente válido.'); return; }
    if (!conta.dataPagamento.trim()) { alert('O campo Data de Pagamento é obrigatório.'); return; }
    if (!conta.descricao.trim()) { alert('O campo Descrição é obrigatório.'); return; }
    if (!conta.categoria.trim()) { alert('O campo Categoria é obrigatório.'); return; }
    if (!conta.tipo.trim()) { alert('O campo Tipo de Conta é obrigatório.'); return; }
    if (!conta.valor || Number(conta.valor) <= 0) { alert('O campo Valor é obrigatório e deve ser maior que zero.'); return; }
    if (conta.temServico && !conta.servicoId) { alert('Selecione um serviço válido.'); return; }

    onSalvar(conta);
  };

  return (
    <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto mt-6">
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold">
          {conta.id ? 'Editar Conta' : 'Cadastrar Conta'}
        </h2>

        {/* Cliente */}
        <div className="relative">
          <Label htmlFor="clienteBusca">Cliente *</Label>
          <Input
            id="clienteBusca"
            value={clienteBusca}
            onChange={handleClienteBuscaChange}
            onFocus={handleClienteFocus}
            placeholder="Digite o nome do cliente"
            className={inputClass}
            autoComplete="off"
            disabled={readonly}
          />
          {clienteSugestoes.length > 0 && (
            <ul className="absolute z-10 bg-white text-black w-full mt-1 border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto">
              {clienteSugestoes.map(c => (
                <li
                  key={c.id}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => selecionarCliente(c)}
                >
                  {c.nome}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Switch Tem Serviço */}
        <div className="flex items-center space-x-2">
          <Switch checked={conta.temServico} onCheckedChange={onToggleTemServico} disabled={readonly} />
          <Label htmlFor="temServico">Tem serviço?</Label>
        </div>

        {/* Serviço Vinculado */}
        {conta.temServico && (
          <div>
            <Label htmlFor="servicoVinculado">Serviço Vinculado *</Label>
            <select
              id="servicoVinculado"
              value={conta.servicoId ?? ''}
              onChange={(e) => {
                const idSelecionado = e.target.value;
                const servicoSelecionado = servicos.find(s => s.id === idSelecionado);
                onChangeValue('servicoId', idSelecionado);
                onChangeValue('servicoVinculado', servicoSelecionado?.descricao || '');
              }}
              className={inputClass}
              disabled={readonly}
            >
              <option value="">Selecione um serviço</option>
              {servicos.map(s => (
                <option key={s.id} value={s.id}>{s.descricao} - {s.status}</option>
              ))}
            </select>
          </div>
        )}

        {/* Data de Pagamento */}
        <div>
          <Label htmlFor="dataPagamento">Data de Pagamento *</Label>
          <Input
            id="dataPagamento"
            type="date"
            value={conta.dataPagamento}
            onChange={(e) => onChange(e, 'dataPagamento')}
            className={inputClass}
            disabled={readonly}
          />
        </div>

        {/* Descrição */}
        <div>
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            placeholder="Descrição da conta"
            value={conta.descricao}
            onChange={(e) => onChange(e, 'descricao')}
            className={inputClass}
            disabled={readonly}
          />
        </div>

        {/* Categoria */}
        <div>
          <Label htmlFor="categoria">Categoria *</Label>
          <select
            id="categoria"
            value={conta.categoria}
            onChange={(e) => onChange(e, 'categoria')}
            className={inputClass}
            disabled={readonly}
          >
            {categorias.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Tipo de Conta */}
        <div>
          <Label htmlFor="tipo">Tipo de Conta *</Label>
          <select
            id="tipo"
            value={conta.tipo}
            onChange={(e) => onChange(e, 'tipo')}
            className={inputClass}
            disabled={readonly}
          >
            <option value="">Selecione o tipo</option>
            <option value="A Pagar">A Pagar</option>
            <option value="A Receber">A Receber</option>
          </select>
        </div>

        {/* Valor */}
        <div>
          <Label htmlFor="valor">Valor *</Label>
          <Input
            id="valor"
            type="number"
            value={conta.valor}
            onChange={(e) => onChange(e, 'valor')}
            className={inputClass}
            disabled={readonly}
          />
        </div>

        {/* Pago */}
        <div className="flex items-center space-x-2">
          <Switch checked={conta.pago || false} onCheckedChange={onTogglePago} disabled={readonly} />
          <Label htmlFor="pago">Pago?</Label>
        </div>

        {/* Observações */}
        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={conta.observacoes}
            onChange={(e) => onChange(e, 'observacoes')}
            className={inputClass}
            disabled={readonly}
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={onCancelar} disabled={readonly || loading}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={readonly || loading} className="relative">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                {conta.id ? 'Salvando...' : 'Cadastrando...'}
              </div>
            ) : (
              conta.id ? 'Salvar' : 'Cadastrar'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}