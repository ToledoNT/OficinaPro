'use client';

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Cliente, Endereco, Veiculo, ViewMode } from "@/app/interfaces/clientes-interface";

interface ClienteFormProps {
  cliente: Cliente;
  onChange: <K extends keyof Cliente>(field: K, value: Cliente[K]) => void;
  onChangeEndereco: <K extends keyof Endereco>(field: K, value: string) => void;
  onChangeVeiculo: <K extends keyof Veiculo>(field: K, value: string, index: number) => void;
  onSalvar: (cliente: Cliente) => void;
  onCancelar: () => void;
  viewMode: ViewMode;
  loading?: boolean;
  onAddVeiculo?: () => void; 
}

export const ClienteForm = ({
  cliente,
  onChange,
  onChangeEndereco,
  onChangeVeiculo,
  onSalvar,
  onCancelar,
  viewMode,
  loading = false,
}: ClienteFormProps) => {
  const veiculos = cliente.veiculos ?? [];
  const inputClass =
    "bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const handleAddVeiculo = () => {
    const novosVeiculos: Veiculo[] = [
      ...veiculos,
      { modelo: "", placa: "", ano: "", cor: "", chassi: "" },
    ];
    onChange("veiculos", novosVeiculos);
  };

  const handleSalvar = () => {
    const veiculosAjustados = veiculos.map((v) => ({
      ...v,
      placa: v.placa && v.placa.trim() !== "" ? v.placa : "Sem Placa",
    }));

    const clienteAjustado: Cliente = {
      ...cliente,
      veiculos: veiculosAjustados,
    };

    onSalvar(clienteAjustado);
  };

  return (
    <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto">
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold">
          {viewMode === "editar" ? "Editar Cliente" : "Cadastrar Novo Cliente"}
        </h2>

        {/* Dados do Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Nome completo *</Label>
            <Input
              required
              placeholder="Ex: João da Silva"
              value={cliente.nome}
              onChange={(e) => onChange("nome", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <Label>Telefone *</Label>
            <Input
              required
              placeholder="Ex: (11) 91234-5678"
              value={cliente.telefone}
              onChange={(e) => onChange("telefone", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <Switch
              id="whatsapp"
              checked={cliente.isWhatsapp}
              onCheckedChange={(checked) => onChange("isWhatsapp", checked)}
            />
            <Label htmlFor="whatsapp">WhatsApp?</Label>
          </div>

          <div>
            <Label>CPF</Label>
            <Input
              placeholder="Ex: 123.456.789-00"
              value={cliente.cpf}
              onChange={(e) => onChange("cpf", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-4 pt-4 border-t border-gray-700">
          <h3 className="font-semibold text-lg">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(cliente.endereco).map(([campo, valor]) => (
              <div key={campo}>
                <Label>{campo.charAt(0).toUpperCase() + campo.slice(1)}</Label>
                <Input
                  value={valor || ""}
                  onChange={(e) => onChangeEndereco(campo as keyof Endereco, e.target.value)}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Observações */}
        <div>
          <Label>Observações</Label>
          <Input
            placeholder="Observações sobre o cliente"
            value={cliente.observacoes || ""}
            onChange={(e) => onChange("observacoes", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Veículos */}
        <div className="space-y-6 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Veículos</h3>
            <Button onClick={handleAddVeiculo} className="bg-green-600 hover:bg-green-700">
              + Adicionar veículo
            </Button>
          </div>

          {veiculos.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhum veículo cadastrado</p>
          ) : (
            veiculos.map((v, i) => (
              <div
                key={i}
                className="bg-[#0f172a] border border-gray-700 p-4 rounded-md space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Modelo</Label>
                    <Input
                      placeholder="Ex: Gol 1.0"
                      value={v.modelo || ""}
                      onChange={(e) => onChangeVeiculo("modelo", e.target.value, i)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <Label>Placa</Label>
                    <Input
                      placeholder="Ex: ABC1D23"
                      value={v.placa || ""}
                      onChange={(e) => onChangeVeiculo("placa", e.target.value, i)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <Label>Ano</Label>
                    <Input
                      placeholder="Ex: 2020"
                      value={v.ano || ""}
                      onChange={(e) => onChangeVeiculo("ano", e.target.value, i)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <Label>Cor</Label>
                    <Input
                      placeholder="Ex: Prata"
                      value={v.cor || ""}
                      onChange={(e) => onChangeVeiculo("cor", e.target.value, i)}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Chassi</Label>
                    <Input
                      placeholder="Número do chassi"
                      value={v.chassi || ""}
                      onChange={(e) => onChangeVeiculo("chassi", e.target.value, i)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            className="border border-gray-500 text-gray-300 hover:bg-gray-700"
            onClick={onCancelar}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Salvando...</span>
              </div>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};