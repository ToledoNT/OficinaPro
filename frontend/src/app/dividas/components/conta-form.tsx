'use client';

import { Button } from '@/app/clientes/components/ui/button';
import { Card, CardContent } from '@/app/clientes/components/ui/card';
import { Input } from '@/app/clientes/components/ui/input';
import { Label } from '@/app/clientes/components/ui/label';
import { Switch } from '@/app/clientes/components/ui/switch';
import { Textarea } from '@/app/clientes/components/ui/textarea';

export interface Conta {
  id: number;
  dataPagamento: string;
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
  inputClass: string;
  onChange: <K extends keyof Conta>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: K
  ) => void;
  onTogglePago: (checked: boolean) => void;
  onToggleTemServico: (checked: boolean) => void;
  onCancelar: () => void;
  onSalvar: () => void;
}

export function ContaForm({
  conta,
  inputClass,
  onChange,
  onTogglePago,
  onToggleTemServico,
  onCancelar,
  onSalvar,
}: ContaFormProps) {
  return (
    <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto mt-6">
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold">
          {conta.id === 0 ? 'Cadastrar Conta' : 'Editar Conta'}
        </h2>

        <div>
          <Label htmlFor="cliente">Cliente *</Label>
          <Input
            id="cliente"
            placeholder="Nome do cliente"
            value={conta.cliente}
            onChange={(e) => onChange(e, 'cliente')}
            className={inputClass}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch checked={conta.temServico} onCheckedChange={onToggleTemServico} />
          <Label htmlFor="temServico">Tem serviço?</Label>
        </div>

        {conta.temServico && (
          <div>
            <Label htmlFor="servicoVinculado">Serviço Vinculado *</Label>
            <Input
              id="servicoVinculado"
              placeholder="Descreva o serviço vinculado"
              value={conta.servicoVinculado}
              onChange={(e) => onChange(e, 'servicoVinculado')}
              className={inputClass}
            />
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
          <Button onClick={onSalvar} className="bg-green-600 hover:bg-green-700">
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
