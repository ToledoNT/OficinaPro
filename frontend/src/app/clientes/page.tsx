"use client";

import { useState } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Card, CardContent } from "../components/ui/card";
import { Cliente, Moto } from "../interfaces/clientes-interface";

type ViewMode = "ver" | "cadastrar" | "editar";

export default function Clientes() {
  const [viewMode, setViewMode] = useState<ViewMode>("ver");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteAtual, setClienteAtual] = useState<Cliente>(getClienteVazio());
  const [filtro, setFiltro] = useState("");

  function getClienteVazio(): Cliente {
    return {
      id: Date.now(),
      nome: "",
      telefone: "",
      whatsapp: false,
      cpf: "",
      endereco: "",
      observacoes: "",
      motos: [{ placa: "", modelo: "", ano: "", cor: "", chassi: "" }],
    };
  }

  const handleChange = <K extends keyof Cliente>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: K
  ) => {
    setClienteAtual((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleMotoChange = <K extends keyof Moto>(
    e: React.ChangeEvent<HTMLInputElement>,
    field: K,
    index: number
  ) => {
    setClienteAtual((prev) => {
      const newMotos = [...prev.motos];
      newMotos[index] = { ...newMotos[index], [field]: e.target.value };
      return { ...prev, motos: newMotos };
    });
  };

  const addMoto = () => {
    setClienteAtual((prev) => ({
      ...prev,
      motos: [...prev.motos, { placa: "", modelo: "", ano: "", cor: "", chassi: "" }],
    }));
  };

  const handleWhatsappChange = (checked: boolean) => {
    setClienteAtual((prev) => ({ ...prev, whatsapp: checked }));
  };

  const salvarCliente = () => {
    if (!clienteAtual.nome.trim()) {
      alert("O nome do cliente é obrigatório.");
      return;
    }

    if (viewMode === "cadastrar") {
      setClientes((prev) => [...prev, clienteAtual]);
      alert("Cliente registrado!");
    } else if (viewMode === "editar") {
      setClientes((prev) => prev.map((c) => (c.id === clienteAtual.id ? clienteAtual : c)));
      alert("Cliente atualizado!");
    }

    setClienteAtual(getClienteVazio());
    setViewMode("ver");
  };

  const iniciarEdicao = (cliente: Cliente) => {
    setClienteAtual(cliente);
    setViewMode("editar");
  };

  const deletarCliente = (id: number) => {
    if (confirm("Deseja realmente deletar este cliente?")) {
      setClientes((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const inputClass =
    "bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400";

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Navegação */}
        <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
          <div className="space-x-4">
            <Button onClick={() => setViewMode("ver")} className="bg-blue-600 hover:bg-blue-700">
              Ver Clientes
            </Button>
            <Button
              onClick={() => {
                setClienteAtual(getClienteVazio());
                setViewMode("cadastrar");
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Cadastrar Cliente
            </Button>
          </div>
          {viewMode === "ver" && (
            <Input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar cliente por nome..."
              className={inputClass + " max-w-xs"}
            />
          )}
        </div>

        {viewMode === "ver" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientesFiltrados.length === 0 ? (
              <p>Nenhum cliente encontrado.</p>
            ) : (
              clientesFiltrados.map((c) => (
                <Card key={c.id} className="bg-[#1e293b] border border-gray-700">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold mb-1">{c.nome}</h3>
                    <p className="text-gray-300 text-sm">{c.telefone}</p>
                    {c.whatsapp && <span className="text-green-400 text-xs">(WhatsApp)</span>}
                    <ul className="mt-2 text-sm list-disc list-inside text-gray-300">
                      {c.motos.map((m, i) => (
                        <li key={i}>{m.modelo} ({m.placa})</li>
                      ))}
                    </ul>
                    <div className="flex space-x-2 mt-4">
                      <Button onClick={() => iniciarEdicao(c)} className="bg-blue-500 text-sm px-3">
                        Editar
                      </Button>
                      <Button
                        onClick={() => deletarCliente(c.id)}
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

        {(viewMode === "cadastrar" || viewMode === "editar") && (
          <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto">
            <CardContent className="space-y-4">
              <h2 className="text-2xl font-semibold">
                {viewMode === "cadastrar" ? "Cadastrar Cliente" : "Editar Cliente"}
              </h2>

              <div>
                <Label>Nome</Label>
                <Input value={clienteAtual.nome} onChange={(e) => handleChange(e, "nome")} className={inputClass} />
              </div>

              <div>
                <Label>Telefone</Label>
                <Input value={clienteAtual.telefone} onChange={(e) => handleChange(e, "telefone")} className={inputClass} />
                <div className="flex items-center mt-1 space-x-2">
                  <Switch checked={clienteAtual.whatsapp} onCheckedChange={handleWhatsappChange} />
                  <Label>WhatsApp?</Label>
                </div>
              </div>

              <div>
                <Label>CPF</Label>
                <Input value={clienteAtual.cpf} onChange={(e) => handleChange(e, "cpf")} className={inputClass} />
              </div>

              <div>
                <Label>Endereço</Label>
                <Input value={clienteAtual.endereco} onChange={(e) => handleChange(e, "endereco")} className={inputClass} />
              </div>

              {clienteAtual.motos.map((moto, index) => (
                <div key={index} className="border-t pt-4 space-y-2">
                  <Label>Moto {index + 1}</Label>
                  <Input placeholder="Placa" value={moto.placa} onChange={(e) => handleMotoChange(e, "placa", index)} className={inputClass} />
                  <Input placeholder="Modelo" value={moto.modelo} onChange={(e) => handleMotoChange(e, "modelo", index)} className={inputClass} />
                  <Input placeholder="Ano" value={moto.ano} onChange={(e) => handleMotoChange(e, "ano", index)} className={inputClass} />
                  <Input placeholder="Cor" value={moto.cor} onChange={(e) => handleMotoChange(e, "cor", index)} className={inputClass} />
                  <Input placeholder="Chassi" value={moto.chassi} onChange={(e) => handleMotoChange(e, "chassi", index)} className={inputClass} />
                </div>
              ))}

              <Button onClick={addMoto} className="w-full bg-gray-600">
                + Adicionar Moto
              </Button>

              <div>
                <Label>Observações</Label>
                <Textarea value={clienteAtual.observacoes} onChange={(e) => handleChange(e, "observacoes")} className={inputClass} />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button onClick={salvarCliente} className="bg-green-600 hover:bg-green-700">
                  {viewMode === "cadastrar" ? "Registrar" : "Salvar"}
                </Button>
                <Button variant="outline" onClick={() => {
                  setClienteAtual(getClienteVazio());
                  setViewMode("ver");
                }}>
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