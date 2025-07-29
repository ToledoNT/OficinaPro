'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Card, CardContent } from '../components/ui/card';

interface Divida {
  id: number;
  data: string;
  cliente: string;
  descricao: string;
  valor: string;
  pago: boolean;
  observacoes: string;
}

type ViewMode = 'ver' | 'cadastrar';

export default function Dividas() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('ver');
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [dividaAtual, setDividaAtual] = useState<Divida>(criarDividaVazia());
  const [filtro, setFiltro] = useState('');

  function criarDividaVazia(): Divida {
    return {
      id: Date.now(),
      data: '',
      cliente: '',
      descricao: '',
      valor: '',
      pago: false,
      observacoes: '',
    };
  }

  function salvarDivida() {
    if (!dividaAtual.descricao.trim()) {
      alert('A descrição da dívida é obrigatória.');
      return;
    }

    setDividas((prev) => {
      const existe = prev.some((d) => d.id === dividaAtual.id);
      return existe
        ? prev.map((d) => (d.id === dividaAtual.id ? dividaAtual : d))
        : [...prev, dividaAtual];
    });

    alert('Dívida salva!');
    setDividaAtual(criarDividaVazia());
    setViewMode('ver');
  }

  const deletarDivida = (id: number) => {
    if (confirm('Deseja realmente deletar esta dívida?')) {
      setDividas((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleChange = <K extends keyof Divida>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: K
  ) => {
    setDividaAtual((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const dividasFiltradas = dividas.filter((d) =>
    d.cliente.toLowerCase().includes(filtro.toLowerCase())
  );

  // -------- Ajuste aqui --------
  const inputClass =
    'bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 caret-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Botões de ação */}
        <div className="flex flex-wrap gap-4 mb-4">
          <Button
            onClick={() => setViewMode('ver')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Ver Dívidas
          </Button>
          <Button
            onClick={() => {
              setDividaAtual(criarDividaVazia());
              setViewMode('cadastrar');
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Cadastrar Dívida
          </Button>
          {/* Botão Voltar para Início */}
          <Button
            variant="outline"
            className="border border-gray-500 text-gray-200 hover:bg-gray-700"
            onClick={() => router.push('/')}
          >
            ← Voltar para Início
          </Button>
        </div>

        {/* Campo de busca */}
        {viewMode === 'ver' && (
          <div className="mb-8">
            <Input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar cliente..."
              className={inputClass + ' max-w-sm'}
            />
          </div>
        )}

        {/* Lista de dívidas */}
        {viewMode === 'ver' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dividasFiltradas.length === 0 ? (
              <p className="text-gray-400">Nenhuma dívida encontrada.</p>
            ) : (
              dividasFiltradas.map((d) => (
                <Card key={d.id} className="bg-[#1e293b] border border-gray-700">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold">{d.cliente}</h3>
                    <p>
                      <strong>Data:</strong> {d.data}
                    </p>
                    <p>
                      <strong>Descrição:</strong> {d.descricao}
                    </p>
                    <p>
                      <strong>Valor:</strong> R$ {d.valor}
                    </p>
                    <p>
                      <strong>Pago:</strong> {d.pago ? 'Sim' : 'Não'}
                    </p>
                    <p className="text-sm text-gray-400">{d.observacoes}</p>

                    <div className="flex space-x-2 mt-2">
                      <Button
                        onClick={() => {
                          setDividaAtual(d);
                          setViewMode('cadastrar');
                        }}
                        className="bg-blue-500 text-sm px-3"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => deletarDivida(d.id)}
                        variant="outline"
                        className="text-sm px-3 border-red-500 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        Deletar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Formulário de cadastro/edição */}
        {viewMode === 'cadastrar' && (
          <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto mt-6">
            <CardContent className="space-y-6">
              <h2 className="text-2xl font-semibold">
                {dividaAtual.id ? 'Editar Dívida' : 'Cadastrar Dívida'}
              </h2>

              <div>
                <Label>Cliente *</Label>
                <Input
                  placeholder="Nome do cliente"
                  value={dividaAtual.cliente}
                  onChange={(e) => handleChange(e, 'cliente')}
                  className={inputClass}
                />
              </div>

              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={dividaAtual.data}
                  onChange={(e) => handleChange(e, 'data')}
                  className={inputClass}
                />
              </div>

              <div>
                <Label>Descrição *</Label>
                <Input
                  placeholder="Descrição da dívida"
                  value={dividaAtual.descricao}
                  onChange={(e) => handleChange(e, 'descricao')}
                  className={inputClass}
                />
              </div>

              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  placeholder="Valor em R$"
                  value={dividaAtual.valor}
                  onChange={(e) => handleChange(e, 'valor')}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={dividaAtual.pago}
                  onCheckedChange={(checked) =>
                    setDividaAtual((prev) => ({ ...prev, pago: checked }))
                  }
                />
                <Label>Pago?</Label>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  placeholder="Observações adicionais..."
                  value={dividaAtual.observacoes}
                  onChange={(e) => handleChange(e, 'observacoes')}
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDividaAtual(criarDividaVazia());
                    setViewMode('ver');
                  }}
                >
                  ← Voltar
                </Button>
                <Button onClick={salvarDivida} className="bg-green-600 hover:bg-green-700">
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDividaAtual(criarDividaVazia());
                    setViewMode('ver');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}