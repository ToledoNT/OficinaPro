"use client";

import { useState } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Card, CardContent } from "../components/ui/card";

interface Divida {
  id: number;
  data: string;
  descricao: string;
  valor: string;
  pago: boolean;
  observacoes: string;
}

type ViewMode = "menu" | "cadastrar" | "ver";

export default function Dividas() {
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [dividaAtual, setDividaAtual] = useState<Divida>(criarDividaVazia());

  function criarDividaVazia(): Divida {
    return {
      id: Date.now(),
      data: "",
      descricao: "",
      valor: "",
      pago: false,
      observacoes: "",
    };
  }

  function salvarDivida() {
    if (!dividaAtual.descricao.trim()) {
      alert("A descrição da dívida é obrigatória.");
      return;
    }

    setDividas((prev) => [...prev, dividaAtual]);
    alert("Dívida registrada!");
    setDividaAtual(criarDividaVazia());
    setViewMode("menu");
  }

  const handleChange = <K extends keyof Divida>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: K
  ) => {
    setDividaAtual((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const inputClass =
    "bg-white text-black placeholder-gray-500 border border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {viewMode === "menu" && (
          <>
            <h1 className="text-3xl font-bold mb-6">Menu de Dívidas</h1>
            <Button onClick={() => setViewMode("cadastrar")} className="bg-blue-600 hover:bg-blue-700">
              Cadastrar Dívida
            </Button>
            <Button onClick={() => setViewMode("ver")} className="bg-gray-600 hover:bg-gray-700">
              Ver Dívidas
            </Button>
          </>
        )}

        {viewMode === "cadastrar" && (
          <Card className="bg-[#1e293b] p-6 border border-gray-700">
            <CardContent className="space-y-6">
              <h2 className="text-2xl font-semibold">Cadastrar Dívida</h2>

              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={dividaAtual.data}
                  onChange={(e) => handleChange(e, "data")}
                  className={inputClass}
                />
              </div>

              <div>
                <Label>Descrição *</Label>
                <Input
                  placeholder="Descrição da dívida"
                  value={dividaAtual.descricao}
                  onChange={(e) => handleChange(e, "descricao")}
                  className={inputClass}
                />
              </div>

              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  placeholder="Valor em R$"
                  value={dividaAtual.valor}
                  onChange={(e) => handleChange(e, "valor")}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={dividaAtual.pago}
                  onCheckedChange={(checked) => setDividaAtual((prev) => ({ ...prev, pago: checked }))}
                />
                <Label>Pago?</Label>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  placeholder="Observações..."
                  value={dividaAtual.observacoes}
                  onChange={(e) => handleChange(e, "observacoes")}
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button onClick={salvarDivida} className="bg-green-600 hover:bg-green-700">
                  Salvar Dívida
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDividaAtual(criarDividaVazia());
                    setViewMode("menu");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === "ver" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Histórico de Dívidas</h2>
            {dividas.length === 0 ? (
              <p className="text-gray-400">Nenhuma dívida registrada.</p>
            ) : (
              <div className="space-y-4">
                {dividas.map((d) => (
                  <Card key={d.id} className="bg-[#1e293b] p-4 border border-gray-700">
                    <CardContent>
                      <p><strong>Data:</strong> {d.data}</p>
                      <p><strong>Descrição:</strong> {d.descricao}</p>
                      <p><strong>Valor:</strong> R$ {d.valor}</p>
                      <p><strong>Pago:</strong> {d.pago ? "Sim" : "Não"}</p>
                      <p><strong>Observações:</strong> {d.observacoes}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <Button
              onClick={() => setViewMode("menu")}
              className="mt-6 bg-gray-700 hover:bg-gray-800"
            >
              Voltar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
