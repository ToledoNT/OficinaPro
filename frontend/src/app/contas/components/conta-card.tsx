'use client';

import { Button } from "@/app/clientes/components/ui/button";
import { Card, CardContent } from "@/app/clientes/components/ui/card";
import { ContaCardProps } from '@/app/interfaces/contas-interface';

export function ContaCard({
  conta,
  formatarValor,
  onVer,
  onEditar,
  onDelete,
  loading = false,
}: ContaCardProps) {
  return (
    <Card className="bg-[#1e293b] border border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-5 text-gray-300">
        <h3 className="text-xl font-bold mb-2 text-white truncate">
          {conta.descricao || 'Sem descrição'}
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          <div>
            <p><span className="font-semibold text-gray-200">Cliente:</span> {conta.clienteNome || '-'}</p>
            <p><span className="font-semibold text-gray-200">Categoria:</span> {conta.categoria || '-'}</p>
            <p><span className="font-semibold text-gray-200">Tipo:</span> {conta.tipo || '-'}</p>
          </div>
          <div>
            <p><span className="font-semibold text-gray-200">Valor:</span> {formatarValor(conta.valor)}</p>
            <p><span className="font-semibold text-gray-200">Pago:</span> {conta.pago ? 'Sim' : 'Não'}</p>
            <p><span className="font-semibold text-gray-200">Data de Pagamento:</span> {conta.dataPagamento || '-'}</p>
          </div>
        </div>

        {conta.observacoes && (
          <p className="mb-2 text-gray-400"><span className="font-semibold text-gray-200">Observações:</span> {conta.observacoes}</p>
        )}

        {conta.temServico && (
          <div className="mb-3">
            <p className="font-semibold text-white mb-1">Serviço vinculado:</p>
            <p className="text-sm text-gray-400">
              {conta.servicoVinculado || `ID: ${conta.descricao}`}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            className="text-yellow-400 border-yellow-400 hover:bg-yellow-600 hover:text-white text-xs px-4 py-1"
            onClick={onVer}
            disabled={loading}
          >
            Ver
          </Button>

          <Button
            className="bg-blue-500 hover:bg-blue-600 text-xs px-4 py-1"
            onClick={() => onEditar(conta)}
            disabled={loading}
          >
            Editar
          </Button>

          <Button
  variant="outline"
  className="text-red-500 border-red-500 hover:bg-red-600 hover:text-white text-xs px-4 py-1"
  onClick={() => {
    if (conta.id !== undefined) {
      onDelete(conta.id);
    } else {
      alert('ID da conta inválido');
    }
  }}
  disabled={loading}
>
  {loading ? "Deleting..." : "Delete"}
</Button>

        </div>
      </CardContent>
    </Card>
  );
}