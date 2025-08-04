'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Card, CardContent } from '../components/ui/card';
import { Servico } from '../interfaces/service-interface';

type ViewMode = 'ver' | 'cadastrar';

const STATUS_OPTIONS = [
  'Em fila',
  'Esperando cliente',
  'Aguardando peça',
  'Em andamento',
  'Finalizado',
  'Cancelado',
  'Entregue',
  'Pendente de pagamento',
];

export default function ServicosPage() {
  const router = useRouter(); 
  const [viewMode, setViewMode] = useState<ViewMode>('ver');
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoAtual, setServicoAtual] = useState<Servico>(criarServicoVazio());
  const [filtro, setFiltro] = useState('');

  function criarServicoVazio(): Servico {
    return {
      id: Date.now(),
      cliente: '',
      data: '',
      descricao: '',
      finalizado: false,
      status: 'Em fila',
      observacoes: '',
    };
  }

  function salvarServico() {
    if (!servicoAtual.cliente || !servicoAtual.data || !servicoAtual.descricao) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    setServicos((prev) => {
      const existe = prev.some((s) => s.id === servicoAtual.id);
      return existe
        ? prev.map((s) => (s.id === servicoAtual.id ? servicoAtual : s))
        : [...prev, servicoAtual];
    });

    alert('Serviço registrado com sucesso!');
    setServicoAtual(criarServicoVazio());
    setViewMode('ver');
  }

  const servicosFiltrados = servicos.filter((s) =>
    `${s.cliente} ${s.descricao}`.toLowerCase().includes(filtro.toLowerCase())
  );

  const inputClass =
    'bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Botões de ação */}
        <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
          <div className="space-x-4">
            <Button onClick={() => setViewMode('ver')} className="bg-blue-600 hover:bg-blue-700">
              Ver Serviços
            </Button>
            <Button
              onClick={() => {
                setServicoAtual(criarServicoVazio());
                setViewMode('cadastrar');
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Cadastrar Serviço
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
          {viewMode === 'ver' && (
            <Input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por cliente ou descrição..."
              className={inputClass + ' max-w-sm'}
            />
          )}
        </div>

        {/* Lista de Serviços */}
        {viewMode === 'ver' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicosFiltrados.length === 0 ? (
              <p>Nenhum serviço encontrado.</p>
            ) : (
              servicosFiltrados.map((s) => (
                <Card key={s.id} className="bg-[#1e293b] border border-gray-700">
                  <CardContent className="p-4 space-y-1 text-sm text-gray-300">
                    <p><strong>Cliente:</strong> {s.cliente}</p>
                    <p><strong>Data:</strong> {s.data}</p>
                    <p><strong>Descrição:</strong> {s.descricao}</p>
                    <p><strong>Status:</strong> {s.status}</p>
                    <p><strong>Finalizado:</strong> {s.finalizado ? 'Sim' : 'Não'}</p>
                    <p><strong>Observações:</strong> {s.observacoes || '-'}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Formulário de cadastro/edição */}
        {viewMode === 'cadastrar' && (
          <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto">
            <CardContent className="space-y-6">
              <h2 className="text-2xl font-semibold">Cadastrar Serviço</h2>

              <div>
                <Label>Cliente *</Label>
                <Input
                  placeholder="Nome do cliente"
                  value={servicoAtual.cliente}
                  onChange={(e) => setServicoAtual({ ...servicoAtual, cliente: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={servicoAtual.data}
                  onChange={(e) => setServicoAtual({ ...servicoAtual, data: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <Label>Descrição *</Label>
                <Input
                  placeholder="Descrição do serviço"
                  value={servicoAtual.descricao}
                  onChange={(e) => setServicoAtual({ ...servicoAtual, descricao: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <Label>Status *</Label>
                <select
                  value={servicoAtual.status}
                  onChange={(e) => setServicoAtual({ ...servicoAtual, status: e.target.value })}
                  className="w-full rounded border border-gray-600 bg-[#1e293b] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={servicoAtual.finalizado}
                  onCheckedChange={(checked) =>
                    setServicoAtual((prev) => ({ ...prev, finalizado: checked }))
                  }
                />
                <Label>Finalizado?</Label>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  placeholder="Observações adicionais..."
                  value={servicoAtual.observacoes}
                  onChange={(e) =>
                    setServicoAtual((prev) => ({ ...prev, observacoes: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              {/* Botões alinhados à direita */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setServicoAtual(criarServicoVazio());
                    setViewMode('ver');
                  }}
                >
                  ← Voltar
                </Button>
                <Button
                  onClick={salvarServico}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Salvar Serviço
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewMode('ver')}
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