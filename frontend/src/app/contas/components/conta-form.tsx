'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/clientes/components/ui/button';
import { Card, CardContent } from '@/app/clientes/components/ui/card';
import { Input } from '@/app/clientes/components/ui/input';
import { Label } from '@/app/clientes/components/ui/label';
import { Switch } from '@/app/clientes/components/ui/switch';
import { Textarea } from '@/app/clientes/components/ui/textarea';
import { Cliente } from '@/app/interfaces/clientes-interface';
import { Servico } from '@/app/interfaces/service-interface';

export interface Conta {
  id: number;
  dataPagamento: string;
  clienteId?: number;
  cliente: string;
  descricao: string;
  categoria: string;
  tipo: 'A pagar' | 'A receber';
  valor: string;
  pago: boolean;
  observacoes: string;
  temServico: boolean;
  servicoVinculado: string;
}

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

interface ContaFormProps {
  conta: Conta;
  clientes: Cliente[];
  servicos: Servico[]; // lista de serviços já carregada e enviada pelo pai
  inputClass: string;
  onChange: <K extends keyof Conta>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: K
  ) => void;
  onChangeValue: <K extends keyof Conta>(field: K, value: Conta[K]) => void;
  onTogglePago: (checked: boolean) => void;
  onToggleTemServico: (checked: boolean) => void;
  onCancelar: () => void;
  onSalvar: () => void;
}

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
  const [clienteBusca, setClienteBusca] = useState(conta.cliente || '');
  const [clienteSugestoes, setClienteSugestoes] = useState<Cliente[]>([]);

  // Atualiza sugestões conforme digitação
  useEffect(() => {
    const busca = clienteBusca.trim().toLowerCase();
    if (!busca) {
      setClienteSugestoes([]);
      return;
    }
    const resultados = clientes.filter(c => c.nome.toLowerCase().includes(busca));
    setClienteSugestoes(resultados);

    const clienteExato = clientes.find(c => c.nome.toLowerCase() === busca);
    if (clienteExato) {
      selecionarCliente(clienteExato);
    }
  }, [clienteBusca, clientes]);

  // Selecionar cliente e atualizar campos no form
  const selecionarCliente = useCallback((cliente: Cliente) => {
    onChangeValue('clienteId', Number(cliente.id));
    onChangeValue('cliente', cliente.nome);
    setClienteBusca(cliente.nome);
    setClienteSugestoes([]);
  }, [onChangeValue]);

  return (
    <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto mt-6">
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold">
          {conta.id === 0 ? 'Cadastrar Conta' : 'Editar Conta'}
        </h2>

        {/* Campo de busca de cliente */}
        <div className="relative">
          <Label htmlFor="clienteBusca">Cliente *</Label>
          <Input
            id="clienteBusca"
            value={clienteBusca}
            onChange={(e) => setClienteBusca(e.target.value)}
            placeholder="Digite o nome do cliente"
            className={inputClass}
          />
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

        {/* Tem serviço */}
        <div className="flex items-center space-x-2">
          <Switch checked={conta.temServico} onCheckedChange={onToggleTemServico} />
          <Label htmlFor="temServico">Tem serviço?</Label>
        </div>

        {/* Seleção de serviço vinculado */}
        {conta.temServico && (
          <div>
            <Label htmlFor="servicoVinculado">Serviço Vinculado *</Label>
            <select
              id="servicoVinculado"
              value={conta.servicoVinculado}
              onChange={(e) => onChange(e, 'servicoVinculado')}
              className={`${inputClass} w-full px-3 py-2 rounded`}
            >
              <option value="">Selecione um serviço</option>
              {servicos.map(s => (
                <option key={s.id} value={s.descricao}>
                  {s.descricao} - {s.status}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Data pagamento */}
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

        {/* Descrição */}
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

        {/* Categoria */}
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

        {/* Tipo */}
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

        {/* Valor */}
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

        {/* Pago */}
        <div className="flex items-center space-x-2">
          <Switch checked={conta.pago} onCheckedChange={onTogglePago} />
          <Label htmlFor="pago">Pago?</Label>
        </div>

        {/* Observações */}
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

        {/* Botões */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button onClick={onSalvar} className="bg-green-600 hover:bg-green-700">
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
