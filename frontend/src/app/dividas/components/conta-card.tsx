'use client';

import { Conta } from './conta-form';

interface ContaCardProps {
  conta: Conta;
  formatarValor: (valor: string) => string;
  onEditar: (conta: Conta) => void;
  onExcluir: (id: number) => void;
}

export function ContaCard({ conta, formatarValor, onEditar, onExcluir }: ContaCardProps) {
  return (
    <div className="bg-[#1e293b] p-4 rounded border border-gray-700 shadow">
      <h3 className="text-lg font-semibold">{conta.descricao}</h3>
      <p>
        <strong>Cliente:</strong> {conta.cliente}
      </p>
      <p>
        <strong>Categoria:</strong> {conta.categoria}
      </p>
      <p>
        <strong>Tipo:</strong> {conta.tipo}
      </p>
      <p>
        <strong>Valor:</strong> {formatarValor(conta.valor)}
      </p>
      <p>
        <strong>Pago:</strong> {conta.pago ? 'Sim' : 'Não'}
      </p>
      <p>
        <strong>Data de Pagamento:</strong> {conta.dataPagamento}
      </p>

      <div className="flex space-x-2 mt-4">
        <button
          className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
          onClick={() => onEditar(conta)}
        >
          Editar
        </button>
        <button
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
          onClick={() => onExcluir(conta.id)}
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
