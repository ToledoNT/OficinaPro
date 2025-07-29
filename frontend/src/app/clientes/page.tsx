'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';  
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Card, CardContent } from "../components/ui/card";
import { Cliente, Moto } from "../interfaces/clientes-interface";

type ViewMode = "ver" | "cadastrar" | "editar";

export default function Clientes() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("ver");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteAtual, setClienteAtual] = useState<Cliente>(criarClienteVazio());
  const [filtro, setFiltro] = useState("");

  function criarClienteVazio(): Cliente {
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

  function salvarCliente() {
    if (!clienteAtual.nome.trim()) {
      alert("O nome do cliente é obrigatório.");
      return;
    }

    if (viewMode === "cadastrar") {
      setClientes((prev) => [...prev, clienteAtual]);
      alert("Cliente registrado!");
    } else {
      setClientes((prev) =>
        prev.map((c) => (c.id === clienteAtual.id ? clienteAtual : c))
      );
      alert("Cliente atualizado!");
    }

    setClienteAtual(criarClienteVazio());
    setViewMode("ver");
  }

  const deletarCliente = (id: number) => {
    if (confirm("Deseja realmente deletar este cliente?")) {
      setClientes((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  // Classe CSS para inputs - fundo escuro e texto branco para melhor contraste no mobile
  const inputClass =
    "bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Botão Voltar na tela de cadastro/edição */}
        {(viewMode === "cadastrar" || viewMode === "editar") && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => {
                setClienteAtual(criarClienteVazio());
                setViewMode("ver");
              }}
              className="border border-gray-500 text-gray-200 hover:bg-gray-700"
            >
              ← Voltar
            </Button>
          </div>
        )}

        {/* Botões principais (ver, cadastrar, voltar para início) */}
        {viewMode === "ver" && (
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Button
              onClick={() => setViewMode("ver")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ver Clientes
            </Button>
            <Button
              onClick={() => {
                setClienteAtual(criarClienteVazio());
                setViewMode("cadastrar");
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Cadastrar Cliente
            </Button>
            <Button
              variant="outline"
              className="border border-gray-500 text-gray-200 hover:bg-gray-700"
              onClick={() => router.push('/')}
            >
              ← Voltar para Início
            </Button>
          </div>
        )}

        {/* Campo de busca */}
        {viewMode === "ver" && (
          <div className="mb-10">
            <Input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar cliente por nome..."
              className={inputClass + " max-w-sm"}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        )}

        {/* Listagem de clientes */}
        {viewMode === "ver" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientesFiltrados.length === 0 ? (
              <p>Nenhum cliente encontrado.</p>
            ) : (
              clientesFiltrados.map((c) => (
                <ClienteCard
                  key={c.id}
                  cliente={c}
                  onEditar={() => {
                    setClienteAtual(c);
                    setViewMode("editar");
                  }}
                  onDeletar={() => deletarCliente(c.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Formulário de cadastro/edição */}
        {(viewMode === "cadastrar" || viewMode === "editar") && (
          <FormularioCliente
            cliente={clienteAtual}
            setCliente={setClienteAtual}
            onSalvar={salvarCliente}
            onCancelar={() => {
              setClienteAtual(criarClienteVazio());
              setViewMode("ver");
            }}
            inputClass={inputClass}
            onVoltar={() => {
              setClienteAtual(criarClienteVazio());
              setViewMode("ver");
            }}
          />
        )}
      </div>
    </div>
  );
}

// ==================== COMPONENTES ======================

function ClienteCard({
  cliente,
  onEditar,
  onDeletar,
}: {
  cliente: Cliente;
  onEditar: () => void;
  onDeletar: () => void;
}) {
  return (
    <Card className="bg-[#1e293b] border border-gray-700">
      <CardContent className="p-4">
        <h3 className="text-lg font-bold mb-1">{cliente.nome}</h3>
        <p className="text-gray-300 text-sm">{cliente.telefone}</p>
        {cliente.whatsapp && (
          <span className="text-green-400 text-xs">(WhatsApp)</span>
        )}
        <ul className="mt-2 text-sm list-disc list-inside text-gray-300">
          {cliente.motos.map((m, i) => (
            <li key={i}>
              {m.modelo} ({m.placa})
            </li>
          ))}
        </ul>
        <div className="flex space-x-2 mt-4">
          <Button onClick={onEditar} className="bg-blue-500 text-sm px-3">
            Editar
          </Button>
          <Button
            onClick={onDeletar}
            variant="outline"
            className="text-sm px-3 border-red-500 text-red-400 hover:bg-red-600 hover:text-white"
          >
            Deletar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FormularioCliente({
  cliente,
  setCliente,
  onSalvar,
  onCancelar,
  inputClass,
  onVoltar,
}: {
  cliente: Cliente;
  setCliente: React.Dispatch<React.SetStateAction<Cliente>>;
  onSalvar: () => void;
  onCancelar: () => void;
  inputClass: string;
  onVoltar: () => void;
}) {
  const handleChange = <K extends keyof Cliente>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: K
  ) => {
    setCliente((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleMotoChange = <K extends keyof Moto>(
    e: React.ChangeEvent<HTMLInputElement>,
    field: K,
    index: number
  ) => {
    setCliente((prev) => {
      const novasMotos = [...prev.motos];
      novasMotos[index] = { ...novasMotos[index], [field]: e.target.value };
      return { ...prev, motos: novasMotos };
    });
  };

  const addMoto = () => {
    setCliente((prev) => ({
      ...prev,
      motos: [...prev.motos, { placa: "", modelo: "", ano: "", cor: "", chassi: "" }],
    }));
  };

  return (
    <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto">
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold">
          {cliente.id ? "Editar Cliente" : "Cadastrar Novo Cliente"}
        </h2>

        <div>
          <Label>Nome completo *</Label>
          <Input
            required
            placeholder="Ex: João da Silva"
            value={cliente.nome}
            onChange={(e) => handleChange(e, "nome")}
            className={inputClass}
            spellCheck={false}
            autoComplete="off"
            style={{ WebkitTextFillColor: 'white' }}
          />
        </div>

        <div>
          <Label>Telefone / WhatsApp *</Label>
          <Input
            required
            placeholder="Ex: (11) 91234-5678"
            value={cliente.telefone}
            onChange={(e) => handleChange(e, "telefone")}
            className={inputClass}
            spellCheck={false}
            autoComplete="off"
            style={{ WebkitTextFillColor: 'white' }}
          />
          <div className="flex items-center mt-2 space-x-2">
            <Switch
              checked={cliente.whatsapp}
              onCheckedChange={(checked) =>
                setCliente((prev) => ({ ...prev, whatsapp: checked }))
              }
            />
            <Label>WhatsApp?</Label>
          </div>
        </div>

        <div>
          <Label>CPF</Label>
          <Input
            placeholder="Ex: 123.456.789-00"
            value={cliente.cpf}
            onChange={(e) => handleChange(e, "cpf")}
            className={inputClass}
            spellCheck={false}
            autoComplete="off"
            style={{ WebkitTextFillColor: 'white' }}
          />
        </div>

        <div>
          <Label>Endereço completo</Label>
          <Input
            placeholder="Rua, número, bairro, cidade"
            value={cliente.endereco}
            onChange={(e) => handleChange(e, "endereco")}
            className={inputClass}
            spellCheck={false}
            autoComplete="off"
            style={{ WebkitTextFillColor: 'white' }}
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold mt-6">Informações da(s) Moto(s)</h3>

          {cliente.motos.map((moto, index) => (
            <div
              key={index}
              className="border-t border-gray-600 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Label className="col-span-full font-medium">Moto {index + 1}</Label>
              <Input
                placeholder="Placa (Ex: ABC-1234)"
                value={moto.placa}
                onChange={(e) => handleMotoChange(e, "placa", index)}
                className={inputClass}
                spellCheck={false}
                autoComplete="off"
                style={{ WebkitTextFillColor: 'white' }}
              />
              <Input
                placeholder="Modelo (Ex: Honda CG 160)"
                value={moto.modelo}
                onChange={(e) => handleMotoChange(e, "modelo", index)}
                className={inputClass}
                spellCheck={false}
                autoComplete="off"
                style={{ WebkitTextFillColor: 'white' }}
              />
              <Input
                placeholder="Ano (Ex: 2020)"
                value={moto.ano}
                onChange={(e) => handleMotoChange(e, "ano", index)}
                className={inputClass}
                spellCheck={false}
                autoComplete="off"
                style={{ WebkitTextFillColor: 'white' }}
              />
              <Input
                placeholder="Cor (Ex: Vermelha)"
                value={moto.cor}
                onChange={(e) => handleMotoChange(e, "cor", index)}
                className={inputClass}
                spellCheck={false}
                autoComplete="off"
                style={{ WebkitTextFillColor: 'white' }}
              />
              <Input
                placeholder="Chassi (Ex: 9C2KC1670ER000001)"
                value={moto.chassi}
                onChange={(e) => handleMotoChange(e, "chassi", index)}
                className={inputClass + " sm:col-span-2"}
                spellCheck={false}
                autoComplete="off"
                style={{ WebkitTextFillColor: 'white' }}
              />
            </div>
          ))}

          <Button onClick={addMoto} className="w-full bg-gray-600 hover:bg-gray-700">
            + Adicionar Moto
          </Button>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <Button variant="outline" onClick={onVoltar}>
            ← Voltar
          </Button>
          <Button onClick={onSalvar} className="bg-green-600 hover:bg-green-700">
            Salvar Cliente
          </Button>
          <Button variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
