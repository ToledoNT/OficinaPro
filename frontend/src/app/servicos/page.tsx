'use client';

import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Card, CardContent } from '../components/ui/card';

interface Servico {
  data: string;
  tipo: string;
  valor: string;
  observacoes: string;
  pago: boolean;
}

type ViewMode = 'menu' | 'cadastrar' | 'ver' | 'atualizar' | 'deletar';

export default function Servicos() {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [servico, setServico] = useState<Servico>({
    data: '',
    tipo: '',
    valor: '',
    observacoes: '',
    pago: false,
  });

  const handleChange = <K extends keyof Servico>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: K
  ) => {
    const value = field === 'pago' && e.target instanceof HTMLInputElement
      ? e.target.checked
      : e.target.value;

    setServico((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePagoChange = (checked: boolean) => {
    setServico((prev) => ({
      ...prev,
      pago: checked,
    }));
  };

  const resetServico = () => {
    setServico({
      data: '',
      tipo: '',
      valor: '',
      observacoes: '',
      pago: false,
    });
  };

  const containerClass = "min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-[#0f172a] text-white";
  const cardClass = "max-w-lg w-full bg-[#1a2333] border border-gray-700 rounded-lg shadow-md";
  const inputClass = "bg-[#162a46] border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const buttonPrimaryClass = "bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg shadow-md transition-transform hover:scale-[1.03]";
  const buttonOutlineClass = "border border-gray-500 text-gray-300 hover:bg-gray-700 hover:text-white py-3 rounded-lg transition-colors";
  const titleClass = "text-3xl font-semibold mb-8 text-white";

  if (viewMode === 'menu') {
    return (
      <div className={containerClass}>
        <h1 className="text-4xl font-semibold mb-12 text-white">Menu Serviços</h1>
        <div className="flex flex-col space-y-6 max-w-sm w-full">
          <Button onClick={() => setViewMode('cadastrar')} className={buttonPrimaryClass}>
            Registrar Serviço
          </Button>
          <Button onClick={() => setViewMode('ver')} className={buttonPrimaryClass}>
            Ver Serviços
          </Button>
          <Button onClick={() => setViewMode('atualizar')} className={buttonPrimaryClass}>
            Atualizar Serviço
          </Button>
          <Button onClick={() => setViewMode('deletar')} className={buttonPrimaryClass}>
            Deletar Serviço
          </Button>
        </div>
      </div>
    );
  }

  if (viewMode === 'cadastrar') {
    return (
      <div className={containerClass}>
        <h1 className={titleClass}>Cadastro de Serviço</h1>
        <Card className={cardClass}>
          <CardContent className="space-y-6 px-8 py-6">
            <div>
              <Label className="text-gray-300">Data</Label>
              <Input
                type="date"
                value={servico.data}
                onChange={(e) => handleChange(e, 'data')}
                className={inputClass}
              />
            </div>
            <div>
              <Label className="text-gray-300">Tipo de Serviço</Label>
              <Input
                placeholder="Ex: Troca de óleo"
                value={servico.tipo}
                onChange={(e) => handleChange(e, 'tipo')}
                className={inputClass}
              />
            </div>
            <div>
              <Label className="text-gray-300">Valor (R$)</Label>
              <Input
                type="number"
                placeholder="100.00"
                value={servico.valor}
                onChange={(e) => handleChange(e, 'valor')}
                className={inputClass}
              />
            </div>
            <div className="flex items-center space-x-3">
              <Switch checked={servico.pago} onCheckedChange={handlePagoChange} />
              <Label className="text-gray-300 select-none cursor-pointer">Pago?</Label>
            </div>
            <div>
              <Label className="text-gray-300">Observações</Label>
              <Textarea
                placeholder="Observações do serviço"
                value={servico.observacoes}
                onChange={(e) => handleChange(e, 'observacoes')}
                className={inputClass}
                rows={4}
              />
            </div>

            <div className="flex space-x-6 justify-end mt-8">
              <Button
                onClick={() => {
                  alert('Serviço registrado!');
                  resetServico();
                  setViewMode('menu');
                }}
                className={buttonPrimaryClass}
              >
                Registrar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetServico();
                  setViewMode('menu');
                }}
                className={buttonOutlineClass}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewMode === 'ver') {
    return (
      <div className={containerClass}>
        <h1 className={titleClass}>Ver Serviços</h1>
        <Button
          onClick={() => setViewMode('menu')}
          className="mb-6 bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg shadow-md transition-transform hover:scale-[1.03]"
        >
          Voltar
        </Button>
        <p className="max-w-3xl text-gray-400">
          Aqui você implementa a lista de serviços...
        </p>
      </div>
    );
  }

  if (viewMode === 'atualizar') {
    return (
      <div className={containerClass}>
        <h1 className={titleClass}>Atualizar Serviço</h1>
        <Button
          onClick={() => setViewMode('menu')}
          className="mb-6 bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg shadow-md transition-transform hover:scale-[1.03]"
        >
          Voltar
        </Button>
        <p className="max-w-3xl text-gray-400">Aqui você implementa a atualização...</p>
      </div>
    );
  }

  if (viewMode === 'deletar') {
    return (
      <div className={containerClass}>
        <h1 className={titleClass}>Deletar Serviço</h1>
        <Button
          onClick={() => setViewMode('menu')}
          className="mb-6 bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg shadow-md transition-transform hover:scale-[1.03]"
        >
          Voltar
        </Button>
        <p className="max-w-3xl text-gray-400">Aqui você implementa a exclusão do serviço...</p>
      </div>
    );
  }

  return null;
}
