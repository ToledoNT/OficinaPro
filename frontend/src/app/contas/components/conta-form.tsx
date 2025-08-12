import React from 'react';
import { Label } from '@/app/clientes/components/ui/label';
import { Input } from '@/app/clientes/components/ui/input';
import { Switch } from '@/app/clientes/components/ui/switch';
import { Textarea } from '@/app/clientes/components/ui/textarea';
import { Button } from '@/app/clientes/components/ui/button';
import { Card, CardContent } from '@/app/clientes/components/ui/card';
import { Cliente } from '@/app/interfaces/clientes-interface';
import { Conta, ContaFormProps } from '@/app/interfaces/contas-interface';

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
  clientes,
  servicos,
  inputClass,
  onChange,
  onChangeValue,
  onTogglePago,
  onToggleTemServico,
  onCancelar,
  onSalvar,
}: ContaFormProps) {
  const [clienteBusca, setClienteBusca] = React.useState(conta.cliente || '');
  const [clienteSugestoes, setClienteSugestoes] = React.useState<Cliente[]>([]);

  React.useEffect(() => {
    const busca = clienteBusca.trim().toLowerCase();
    if (!busca) {
      setClienteSugestoes([]);
      return;
    }
    const resultados = clientes.filter((c) => c.nome.toLowerCase().includes(busca));
    setClienteSugestoes(resultados);
  }, [clienteBusca, clientes]);

  React.useEffect(() => {
    if (conta.cliente !== clienteBusca) {
      setClienteBusca(conta.cliente || '');
    }
  }, [conta.cliente]);

  function selecionarCliente(cliente: Cliente) {
    onChangeValue('clienteId', cliente.id);  
    onChangeValue('cliente', cliente.nome); 
    setClienteBusca(cliente.nome); 
    setClienteSugestoes([]); 
    console.log(cliente.id);
  }

  function handleClienteBuscaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const valor = e.target.value;
    setClienteBusca(valor);
    onChangeValue('cliente', valor); // Atualiza o nome do cliente enquanto o usuário digita

    const clienteEncontrado = clientes.find(
      (c) => c.nome.toLowerCase() === valor.trim().toLowerCase()
    );

    if (clienteEncontrado) {
      // Se o cliente for encontrado, atualiza o clienteId
      onChangeValue('clienteId', clienteEncontrado.id);  // Atualiza clienteId com o id do cliente
    } else {
      // Se não encontrar, limpa o clienteId
      onChangeValue('clienteId', undefined);  // Garante que o campo clienteId seja undefined
    }
  }
  function handleSalvar() {
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
  
    // Aqui estamos criando o objeto de dados a ser enviado para o backend.
    const dadosParaSalvar: Conta = {
      ...conta, 
      clienteId: conta.clienteId || '', // Garante que o clienteId seja uma string
      servicoId: conta.servicoId || '', // Garante que servicoId seja uma string
    };
  
    console.log('Dados para salvar:', dadosParaSalvar);  // Verifique no console se os dados estão corretos
  
    // Chama a função onSalvar e passa os dados com o clienteId
    onSalvar(dadosParaSalvar);
  }
  
  
  return (
    <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto mt-6">
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold">
          {conta.id === 0 || conta.id === undefined ? 'Cadastrar Conta' : 'Editar Conta'}
        </h2>

        <div className="relative">
          <Label htmlFor="clienteBusca">Cliente *</Label>
          <Input
            id="clienteBusca"
            value={clienteBusca}
            onChange={handleClienteBuscaChange}  // Atualiza a busca enquanto o usuário digita
            placeholder="Digite o nome do cliente"
            className={inputClass}
            autoComplete="off"
          />
          {clienteSugestoes.length > 0 && (
            <ul className="absolute z-10 bg-white text-black w-full mt-1 border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto">
              {clienteSugestoes.map((c) => (
                <li
                  key={c.id}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    selecionarCliente(c);  // Atualiza o clienteId quando um cliente é selecionado
                  }}
                >
                  {c.nome}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Campo invisível para armazenar o clienteId */}
        <input type="hidden" name="clienteId" value={conta.clienteId || ''} />

        <div className="flex items-center space-x-2">
          <Switch checked={conta.temServico} onCheckedChange={onToggleTemServico} />
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
            >
              <option value="">Selecione um serviço</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.descricao} - {s.status}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <Label htmlFor="dataPagamento">Data de Pagamento *</Label>
          <Input
            id="dataPagamento"
            type="date"
            value={conta.dataPagamento}
            onChange={(e) => onChange(e, 'dataPagamento')}
            className={inputClass}
          />
        </div>

        <div>
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            placeholder="Descrição da conta"
            value={conta.descricao}
            onChange={(e) => onChange(e, 'descricao')}
            className={inputClass}
          />
        </div>

        <div>
          <Label htmlFor="categoria">Categoria *</Label>
          <select
            id="categoria"
            value={conta.categoria}
            onChange={(e) => onChange(e, 'categoria')}
            className={`${inputClass} w-full px-3 py-2 rounded`}
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <select
            id="tipo"
            value={conta.tipo}
            onChange={(e) => onChange(e, 'tipo')}
            className={`${inputClass} w-full px-3 py-2 rounded`}
          >
            <option value="A pagar">A pagar</option>
            <option value="A receber">A receber</option>
          </select>
        </div>

        <div>
          <Label htmlFor="valor">Valor *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            placeholder="Valor em R$"
            value={conta.valor}
            onChange={(e) => onChange(e, 'valor')}
            className={inputClass}
            min="0"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch checked={conta.pago} onCheckedChange={onTogglePago} />
          <Label htmlFor="pago">Pago?</Label>
        </div>

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            placeholder="Observações adicionais..."
            value={conta.observacoes}
            onChange={(e) => onChange(e, 'observacoes')}
            className={inputClass}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} className="bg-green-600 hover:bg-green-700">
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
