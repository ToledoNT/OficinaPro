'use client';

import { Button } from "@/app/clientes/components/ui/button";
import { Card, CardContent } from "@/app/clientes/components/ui/card";
import { ContaCardProps } from '@/app/interfaces/contas-interface';

export function ContaCard({
  conta,
  formatarValor,
  onVer,
  onEditar,
  onExcluir,
  loading = false,
}: ContaCardProps) {
  return (
    <Card className="bg-[#1e293b] border border-gray-700">
      <CardContent className="p-4 text-gray-300">
        <h3 className="text-lg font-semibold mb-1 text-white">
          {conta.descricao}
        </h3>

        <p><strong>Cliente:</strong> {conta.clienteNome}</p>
        <p><strong>Categoria:</strong> {conta.categoria}</p>
        <p><strong>Tipo:</strong> {conta.tipo}</p>
        <p><strong>Valor:</strong> {formatarValor(conta.valor)}</p>
        <p><strong>Pago:</strong> {conta.pago ? 'Sim' : 'Não'}</p>
        <p><strong>Data de Pagamento:</strong> {conta.dataPagamento}</p>

        {/* Se a conta tiver serviço vinculado */}
        {conta.temServico && (
          <div className="mt-3">
            <p className="font-semibold text-white">Serviço vinculado:</p>
            <p className="text-sm text-gray-400">
              {conta.servicoVinculado || `ID: ${conta.servicoId}`}
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-center gap-3">
          <Button
            variant="outline"
            className="text-yellow-400 border-yellow-400 hover:bg-yellow-600 hover:text-white text-xs px-3"
            onClick={onVer}
            disabled={loading}
          >
            Ver
          </Button>

          <Button
            className="bg-blue-500 text-xs px-3"
            onClick={() => onEditar(conta)}
            disabled={loading}
          >
            Editar
          </Button>

          <Button
            variant="outline"
            className="text-red-500 border-red-500 hover:bg-red-600 hover:text-white text-xs px-3"
            onClick={() => {
              if (conta.id !== undefined) {
                onExcluir(conta.id);
              } else {
                alert('ID da conta inválido');
              }
            }}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}