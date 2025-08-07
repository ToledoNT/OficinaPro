'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Card, CardContent } from "../components/ui/card";

import { Cliente, Veiculo, Endereco } from "../interfaces/clientes-interface";
import { ApiService } from "@/api/api-requests";
import { ApiResponseCliente } from "../interfaces/response-interface";

type ViewMode = "ver" | "cadastrar" | "editar";

function criarClienteVazio(): Cliente {
  return {
    id: "",
    nome: "",
    telefone: "",
    isWhatsapp: false,
    cpf: "",
    endereco: {
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    },
    observacoes: "",
    veiculos: [],
  };
}

export default function Clientes() {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>("ver");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteAtual, setClienteAtual] = useState<Cliente>(criarClienteVazio());
  const [clienteVisualizar, setClienteVisualizar] = useState<Cliente | null>(null);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const api = new ApiService();
        const lista = await api.getClientes();

        const clientesNormalizados = lista.map((cliente) => ({
          ...cliente,
          veiculos: Array.isArray(cliente.veiculos) ? cliente.veiculos : [],
          endereco: {
            rua: cliente.endereco?.rua ?? "",
            numero: cliente.endereco?.numero ?? "",
            bairro: cliente.endereco?.bairro ?? "",
            cidade: cliente.endereco?.cidade ?? "",
            estado: cliente.endereco?.estado ?? "",
            cep: cliente.endereco?.cep ?? "",
          },
        }));

        setClientes(clientesNormalizados);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    };

    carregarClientes();
  }, []);

  const salvarCliente = async () => {
    if (!clienteAtual.nome.trim()) {
      alert("O nome do cliente é obrigatório.");
      return;
    }

    // Filtra veículos removendo os que estiverem 100% vazios
    const veiculosFiltrados = (clienteAtual.veiculos ?? []).filter(
      (v) =>
        (v.placa?.trim() ?? "") !== "" ||
        (v.modelo?.trim() ?? "") !== "" ||
        (v.ano?.trim() ?? "") !== "" ||
        (v.cor?.trim() ?? "") !== "" ||
        (v.chassi?.trim() ?? "") !== ""
    );

    const clienteParaEnviar = {
      nome: clienteAtual.nome,
      telefone: clienteAtual.telefone,
      isWhatsapp: clienteAtual.isWhatsapp,
      cpf: clienteAtual.cpf,
      endereco: clienteAtual.endereco,
      observacoes: clienteAtual.observacoes,
      veiculos: veiculosFiltrados,
    };

    const api = new ApiService();

    try {
      let result: ApiResponseCliente;

      if (viewMode === "cadastrar") {
        result = await api.registerCliente(clienteParaEnviar);
      } else if (viewMode === "editar") {
        result = await api.updateCliente(clienteAtual.id, clienteParaEnviar);
      } else {
        throw new Error("Modo inválido");
      }

      if (result.status && result.data) {
        alert(
          viewMode === "cadastrar"
            ? "Cliente registrado com sucesso!"
            : "Cliente atualizado com sucesso!"
        );

        setClientes((prev) =>
          viewMode === "cadastrar"
            ? [...prev, result.data!]
            : prev.map((c) => (c.id === result.data!.id ? result.data! : c))
        );

        setClienteAtual(criarClienteVazio());
        setViewMode("ver");
      } else {
        alert(`Erro: ${result.message || "Não foi possível salvar o cliente."}`);
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao salvar cliente.");
    }
  };

  const deletarCliente = async (id: string) => {
    if (!confirm("Deseja realmente deletar este cliente?")) return;

    try {
      const api = new ApiService();
      const result = await api.deleteCliente(id);

      if (result) {
        setClientes((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(`Erro ao deletar cliente: ${result || ""}`);
      }
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      alert("Erro ao deletar cliente.");
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const inputClass =
    "bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {viewMode !== "ver" && (
          <div className="mb-6">
            <Button
              variant="outline"
              className="border border-gray-500 text-gray-200 hover:bg-gray-700"
              onClick={() => {
                setClienteAtual(criarClienteVazio());
                setViewMode("ver");
              }}
            >
              ← Voltar
            </Button>
          </div>
        )}

        {viewMode === "ver" && (
          <>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setViewMode("ver")}
              >
                Ver Clientes
              </Button>

              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setClienteAtual(criarClienteVazio());
                  setViewMode("cadastrar");
                }}
              >
                Cadastrar Cliente
              </Button>

              <Button
                variant="outline"
                className="border border-gray-500 text-gray-200 hover:bg-gray-700"
                onClick={() => router.push("/")}
              >
                ← Voltar para Início
              </Button>
            </div>

            <div className="mb-10">
              <Input
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar cliente por nome..."
                className={`${inputClass} max-w-sm`}
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientesFiltrados.length === 0 ? (
                <p>Nenhum cliente encontrado.</p>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <Card
                    key={cliente.id}
                    className="bg-[#1e293b] border border-gray-700"
                  >
                    <CardContent className="p-4 text-gray-300">
                      <h3 className="text-lg font-semibold mb-1 text-white">
                        {cliente.nome}
                      </h3>
                      <p>{cliente.telefone}</p>
                      {cliente.isWhatsapp && (
                        <span className="text-green-400 text-xs">(WhatsApp)</span>
                      )}

                      <ul className="mt-2 text-sm list-disc list-inside">
                        {(cliente.veiculos ?? []).length === 0 && (
                          <li>Nenhum veículo cadastrado</li>
                        )}
                        {(cliente.veiculos ?? []).map((v, i) => (
                          <li key={i}>
                            {v.modelo} ({v.placa})
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 flex justify-center gap-3">
                        <Button
                          variant="outline"
                          className="text-yellow-400 border-yellow-400 hover:bg-yellow-600 hover:text-white text-xs px-3"
                          onClick={() => setClienteVisualizar(cliente)}
                        >
                          Ver
                        </Button>
                        <Button
                          className="bg-blue-500 text-xs px-3"
                          onClick={() => {
                            setClienteAtual(cliente);
                            setViewMode("editar");
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-500 border-red-500 hover:bg-red-600 hover:text-white text-xs px-3"
                          onClick={() => deletarCliente(cliente.id)}
                        >
                          Deletar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

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
            viewMode={viewMode}
          />
        )}

        {clienteVisualizar && (
          <ModalCliente
            cliente={clienteVisualizar}
            onFechar={() => setClienteVisualizar(null)}
          />
        )}
      </div>
    </div>
  );
}

function ModalCliente({
  cliente,
  onFechar,
}: {
  cliente: Cliente;
  onFechar: () => void;
}) {
  const veiculos = cliente.veiculos ?? [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#1e293b] text-white p-6 rounded-lg max-w-xl w-full border border-gray-600">
        <h2 className="text-xl font-semibold mb-4">Dados do Cliente</h2>
        <p>
          <strong>Nome:</strong> {cliente.nome}
        </p>
        <p>
          <strong>Telefone:</strong> {cliente.telefone}
        </p>
        <p>
          <strong>WhatsApp:</strong> {cliente.isWhatsapp ? "Sim" : "Não"}
        </p>
        <p>
          <strong>CPF:</strong> {cliente.cpf}
        </p>
        <p>
          <strong>Endereço:</strong>{" "}
          {`${cliente.endereco.rua}, ${cliente.endereco.numero}, ${cliente.endereco.bairro}, ${cliente.endereco.cidade} - ${cliente.endereco.estado}`}
        </p>
        <p>
          <strong>CEP:</strong> {cliente.endereco.cep}
        </p>
        <p>
          <strong>Observações:</strong> {cliente.observacoes}
        </p>
        <p className="mt-4">
          <strong>Veículos:</strong>
        </p>
        {veiculos.length === 0 && <p>Nenhum veículo cadastrado.</p>}
        {veiculos.map((v, i) => (
          <p key={i}>
            • {v.modelo} — {v.placa} ({v.ano}, {v.cor}, Chassi: {v.chassi})
          </p>
        ))}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onFechar}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormularioCliente({
  cliente,
  setCliente,
  onSalvar,
  onCancelar,
  inputClass,
  viewMode,
}: {
  cliente: Cliente;
  setCliente: React.Dispatch<React.SetStateAction<Cliente>>;
  onSalvar: () => void;
  onCancelar: () => void;
  inputClass: string;
  viewMode: ViewMode;
}) {
  const veiculos = cliente.veiculos ?? [];

  const handleChange = <K extends keyof Cliente>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: K
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setCliente((prev) => ({ ...prev, [field]: value }));
  };

  const handleEnderecoChange = <K extends keyof Endereco>(
    e: React.ChangeEvent<HTMLInputElement>,
    field: K
  ) => {
    setCliente((prev) => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [field]: e.target.value,
      },
    }));
  };

  const handleVeiculoChange = <K extends keyof Veiculo>(
    e: React.ChangeEvent<HTMLInputElement>,
    field: K,
    index: number
  ) => {
    setCliente((prev) => {
      const novosVeiculos = [...(prev.veiculos ?? [])];
      novosVeiculos[index] = { ...novosVeiculos[index], [field]: e.target.value };
      return { ...prev, veiculos: novosVeiculos };
    });
  };

  const addVeiculo = () => {
    setCliente((prev) => ({
      ...prev,
      veiculos: [...(prev.veiculos ?? []), { placa: "", modelo: "", ano: "", cor: "", chassi: "" }],
    }));
  };

  return (
    <Card className="bg-[#1e293b] p-6 border border-gray-700 max-w-3xl mx-auto">
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold">
          {viewMode === "editar" ? "Editar Cliente" : "Cadastrar Novo Cliente"}
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
            style={{ WebkitTextFillColor: "white" }}
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
            style={{ WebkitTextFillColor: "white" }}
          />
          <div className="flex items-center mt-2 space-x-2">
            <Switch
              checked={cliente.isWhatsapp}
              onCheckedChange={(checked) =>
                setCliente((prev) => ({ ...prev, isWhatsapp: checked }))
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
            style={{ WebkitTextFillColor: "white" }}
          />
        </div>

        {/* Endereço */}
        <div>
          <Label>Rua</Label>
          <Input
            value={cliente.endereco.rua}
            onChange={(e) => handleEnderecoChange(e, "rua")}
            className={inputClass}
            spellCheck={false}
            autoComplete="off"
            style={{ WebkitTextFillColor: "white" }}
          />
        </div>

        <div>
          <Label>Número</Label>
          <Input
            value={cliente.endereco.numero}
            onChange={(e) => handleEnderecoChange(e, "numero")}
            className={inputClass}
            spellCheck={false}
            autoComplete="off"
            style={{ WebkitTextFillColor: "white" }}
          />
        </div>

        <div>
          <Label>Bairro</Label>
          <Input
            value={cliente.endereco.bairro}
            onChange={(e) => handleEnderecoChange(e, "bairro")}
            className={inputClass}
            spellCheck={false}
            autoComplete="off"
            style={{ WebkitTextFillColor: "white" }}
          />
        </div>

        <div>
          <Label>Cidade</Label>
          <Input
            value={cliente.endereco.cidade}
            onChange={(e) => handleEnderecoChange(e, "cidade")}
            className={inputClass}
            spellCheck={false}
            autoComplete="off"
            style={{ WebkitTextFillColor: "white" }}
          />
        </div>

        <div>
          <Label>Estado</Label>
          <Input
            value={cliente.endereco.estado}
            onChange={(e) => handleEnderecoChange(e, "estado")}
            className={inputClass}
            spellCheck={false}
            autoComplete="off"
            style={{ WebkitTextFillColor: "white" }}
          />
        </div>

        <div>
          <Label>CEP</Label>
          <Input
            value={cliente.endereco.cep}
            onChange={(e) => handleEnderecoChange(e, "cep")}
            className={inputClass}
            spellCheck={false}
            autoComplete="off"
            style={{ WebkitTextFillColor: "white" }}
          />
        </div>

        <div>
          <Label>Observações</Label>
          <Input
            placeholder="Observações"
            value={cliente.observacoes}
            onChange={(e) => handleChange(e, "observacoes")}
            className={inputClass}
            spellCheck={false}
            autoComplete="off"
            style={{ WebkitTextFillColor: "white" }}
          />
        </div>

        {/* Veículos */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Veículos</h3>

          {veiculos.length === 0 && (
            <p className="text-gray-400">Nenhum veículo cadastrado.</p>
          )}

          {veiculos.map((v, i) => (
            <div
              key={i}
              className="bg-[#0f172a] border border-gray-700 p-4 rounded-md space-y-3"
            >
              <Input
                placeholder="Modelo"
                value={v.modelo}
                onChange={(e) => handleVeiculoChange(e, "modelo", i)}
                className={inputClass}
              />
              <Input
                placeholder="Placa"
                value={v.placa}
                onChange={(e) => handleVeiculoChange(e, "placa", i)}
                className={inputClass}
              />
              <Input
                placeholder="Ano"
                value={v.ano}
                onChange={(e) => handleVeiculoChange(e, "ano", i)}
                className={inputClass}
              />
              <Input
                placeholder="Cor"
                value={v.cor}
                onChange={(e) => handleVeiculoChange(e, "cor", i)}
                className={inputClass}
              />
              <Input
                placeholder="Chassi"
                value={v.chassi}
                onChange={(e) => handleVeiculoChange(e, "chassi", i)}
                className={inputClass}
              />
            </div>
          ))}

          <Button onClick={addVeiculo} className="mt-2 w-full bg-green-600 hover:bg-green-700">
            + Adicionar veículo
          </Button>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            variant="outline"
            className="border border-gray-500 text-gray-300 hover:bg-gray-700"
            onClick={onCancelar}
          >
            Cancelar
          </Button>
          <Button onClick={onSalvar} className="bg-blue-600 hover:bg-blue-700">
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
