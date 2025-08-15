import React, { useEffect, useState } from 'react';
import { Label } from '@/app/clientes/components/ui/label';
import { Input } from '@/app/clientes/components/ui/input';
import { Switch } from '@/app/clientes/components/ui/switch';
import { Textarea } from '@/app/clientes/components/ui/textarea';
import { Button } from '@/app/clientes/components/ui/button';
import { Card, CardContent } from '@/app/clientes/components/ui/card';
import { Cliente } from '@/app/interfaces/clientes-interface';
import { Conta, ContaFormProps } from '@/app/interfaces/contas-interface';
import { Servico } from '@/app/interfaces/service-interface';
import { useClientes, useContas, useServicosPorCliente } from '../hook/conta-hook';

const categorias = [
  'Serviço',
  'Peças',
  'Material',
  'Manutenção',
  'Revisão',
  'Troca de óleo',
  'Pneus',
  'Outros',
];

export function ContaForm({
  conta,
  inputClass,
  onChange,
  onChangeValue,
  onTogglePago,
  onToggleTemServico,
  onCancelar,
  onSalvar,
  readonly = false,
}: ContaFormProps) {
  const { clientes, loadingClientes, errorClientes, fetchClientes } = useClientes();
  const { servicos, loading: loadingServicos, error: errorServicos, fetchServicos } = useServicosPorCliente();
  const { salvarConta } = useContas();

  // Inicializa com o nome do cliente vindo da conta
  const [clienteBusca, setClienteBusca] = useState(conta.clienteNome || conta.cliente || '');
  const [clienteSugestoes, setClienteSugestoes] = useState<Cliente[]>([]);

  // Sempre que a conta mudar, atualiza o campo de busca
  useEffect(() => {
    setClienteBusca(conta.clienteNome || conta.cliente || '');
  }, [conta]);

  // Atualiza sugestões de clientes conforme o usuário digita
  useEffect(() => {
    if (!clientes || clientes.length === 0) return;

    const busca = clienteBusca.trim().toLowerCase();
    if (!busca) {
      setClienteSugestoes([]);
      return;
    }

    const resultados = clientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(busca)
    );
    setClienteSugestoes(resultados);
  }, [clienteBusca, clientes]);

  // Lida com mudanças no campo de busca do cliente
  const handleClienteBuscaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setClienteBusca(valor);
    onChangeValue('cliente', valor);

    const clienteEncontrado = clientes.find(
      (c) => c.nome.toLowerCase() === valor.trim().toLowerCase()
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

  // Foca no campo cliente e carrega clientes se necessário
  const handleClienteFocus = async () => {
    if (clientes.length === 0) {
      await fetchClientes();
    }
  };

  // Lógica de salvar a conta
  const handleSalvar = () => {
    if (!conta.clienteId) {
      alert('Selecione um cliente válido.');
      return;
    }
    if (!conta.dataPagamento.trim()) {
      alert('O campo Data de Pagamento é obrigatório.');
      return;
    }
    if (!conta.descricao.trim()) {
      alert('O campo Descrição é obrigatório.');
      return;
    }
    if (!conta.categoria.trim()) {
      alert('O campo Categoria é obrigatório.');
      return;
    }
    if (!conta.tipo.trim()) {
      alert('O campo Tipo é obrigatório.');
      return;
    }
    if (!conta.valor || Number(conta.valor) <= 0) {
      alert('O campo Valor é obrigatório e deve ser maior que zero.');
      return;
    }
    if (conta.temServico && !conta.servicoId) {
      alert('Selecione um serviço válido.');
      return;
    }

    salvarConta(conta).then((result) => {
      if (result.success) {
        onSalvar(conta);
      } else {
        alert(result.message || 'Erro ao salvar a conta.');
      }
    });
  };

  return (
    <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto mt-6">
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold">
          {conta.id === 0 || conta.id === undefined ? 'Cadastrar Conta' : 'Editar Conta'}
        </h2>

        {/* Input Cliente */}
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
          {loadingClientes && <p className="absolute text-gray-500 mt-1">Carregando...</p>}
          {errorClientes && <p className="absolute text-red-500 mt-1">{errorClientes}</p>}
          {clienteSugestoes.length > 0 && (
            <ul className="absolute z-10 bg-white text-black w-full mt-1 border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto">
              {clienteSugestoes.map((c) => (
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

        {/* Switch e Select de Serviços */}
        <div className="flex items-center space-x-2">
          <Switch checked={conta.temServico} onCheckedChange={onToggleTemServico} disabled={readonly} />
          <Label htmlFor="temServico">Tem serviço?</Label>
        </div>

        {conta.temServico && (
          <div>
            <Label htmlFor="servicoVinculado">Serviço Vinculado *</Label>
            <select
              id="servicoVinculado"
              value={conta.servicoId ?? ''}
              onChange={(e) => {
                const idSelecionado = e.target.value;
                const servicoSelecionado = servicos.find((s) => s.id === idSelecionado);
                onChangeValue('servicoId', idSelecionado);
                onChangeValue('servicoVinculado', servicoSelecionado?.descricao || '');
              }}
              className={`${inputClass} w-full px-3 py-2 rounded`}
              disabled={readonly}
            >
              <option value="">Selecione um serviço</option>
              {loadingServicos && <option>Carregando serviços...</option>}
              {errorServicos && <option disabled>{errorServicos}</option>}
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.descricao} - {s.status}
                </option>
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
            className={`${inputClass} w-full px-3 py-2 rounded`}
            disabled={readonly}
          >
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
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
          <Switch
            checked={conta.pago || false}
            onCheckedChange={(checked) => onChangeValue('pago', checked)}
            disabled={readonly}
          />
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
        <div className="flex space-x-4">
          <Button onClick={onCancelar} variant="outline" disabled={readonly}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} variant="solid" disabled={readonly}>
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

