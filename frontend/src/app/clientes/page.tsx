'use client';

import { useState, useEffect } from "react";
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

export default function Clientes() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("ver");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteAtual, setClienteAtual] = useState<Cliente>(criarClienteVazio());
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function carregarClientes() {
      try {
        const api = new ApiService();
        const lista = await api.getClientes();

        const clientesNormalizados = lista.map((cliente) => ({
          ...cliente,
          veiculos: Array.isArray(cliente.veiculos) ? cliente.veiculos : [],
          endereco: {
            rua: cliente.endereco?.rua || "",
            numero: cliente.endereco?.numero || "",
            bairro: cliente.endereco?.bairro || "",
            cidade: cliente.endereco?.cidade || "",
            estado: cliente.endereco?.estado || "",
            cep: cliente.endereco?.cep || "",
          },
        }));

        console.log("LISTA normalizada:", clientesNormalizados);
        setClientes(clientesNormalizados);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    }

    carregarClientes();
  }, []);

  function criarClienteVazio(): Cliente {
    return {
      id: 0,
      nome: "",
      telefone: "",
      whatsapp: false,
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
      veiculos: [{ placa: "", modelo: "", ano: "", cor: "", chassi: "" }],
    };
  }

  async function salvarCliente() {
    if (!clienteAtual.nome.trim()) {
      alert("O nome do cliente é obrigatório.");
      return;
    }

    const clienteParaEnviar = {
      nome: clienteAtual.nome,
      telefone: clienteAtual.telefone,
      whatsapp: clienteAtual.whatsapp,
      cpf: clienteAtual.cpf,
      endereco: clienteAtual.endereco,
      observacoes: clienteAtual.observacoes,
      veiculos: clienteAtual.veiculos,
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

      console.log("Resposta da API:", result);

      if (result.status) {
        if (result.data) {
          alert(
            viewMode === "cadastrar"
              ? "Cliente registrado com sucesso!"
              : "Cliente atualizado com sucesso!"
          );

          if (viewMode === "cadastrar") {
            setClientes((prev) => [...prev, result.data!]);
          } else if (viewMode === "editar") {
            setClientes((prev) =>
              prev.map((c) => (c.id === result.data!.id ? result.data! : c))
            );
          }

          setClienteAtual(criarClienteVazio());
          setViewMode("ver");
        } else {
          console.error("API retornou sucesso, mas sem dados do cliente:", result);
          alert("Erro: A resposta da API não retornou os dados do cliente.");
        }
      } else {
        console.error("Erro na operação, resposta da API:", result);
        alert(`Erro: ${result.message || "Não foi possível salvar o cliente."}`);
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao salvar cliente.");
    }
  }

  const deletarCliente = async (id: number) => {
    if (confirm("Deseja realmente deletar este cliente?")) {
      try {
        const api = new ApiService();
        const result = await api.deleteCliente(id);
        if (result) {
          setClientes((prev) => prev.filter((c) => c.id !== id));
        } else {
          alert(`Erro ao deletar cliente: ${result || ""}`);
        }
      } catch (error) {
        alert("Erro ao deletar cliente.");
        console.error(error);
      }
    }
  };

  const clientesFiltrados = (clientes ?? []).filter((c) =>
    (c.nome ?? "").toLowerCase().includes(filtro.toLowerCase())
  );

  const inputClass =
    "bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
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

        {viewMode === "ver" && (
          <>
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
                className={inputClass + " max-w-sm"}
                spellCheck={false}
                autoComplete="off"
              />
            </div>

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
            onVoltar={() => {
              setClienteAtual(criarClienteVazio());
              setViewMode("ver");
            }}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
}

function ClienteCard({ cliente, onEditar, onDeletar }: { cliente: Cliente; onEditar: () => void; onDeletar: () => void }) {
  const veiculos = cliente.veiculos ?? []; // garante array

  return (
    <Card className="bg-[#1e293b] border border-gray-700">
      <CardContent className="p-4">
        <h3 className="text-lg font-bold mb-1">{cliente.nome}</h3>
        <p className="text-gray-300 text-sm">{cliente.telefone}</p>
        {cliente.whatsapp && <span className="text-green-400 text-xs">(WhatsApp)</span>}
        <ul className="mt-2 text-sm list-disc list-inside text-gray-300">
          {veiculos.map((v, i) => (
            <li key={i}>
              {v.modelo} ({v.placa})
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
  viewMode,
}: {
  cliente: Cliente;
  setCliente: React.Dispatch<React.SetStateAction<Cliente>>;
  onSalvar: () => void;
  onCancelar: () => void;
  inputClass: string;
  onVoltar: () => void;
  viewMode: ViewMode;
}) {
  const handleChange = <K extends keyof Cliente>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: K
  ) => {
    setCliente((prev) => ({ ...prev, [field]: e.target.value }));
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
      const novosVeiculos = [...prev.veiculos];
      novosVeiculos[index] = { ...novosVeiculos[index], [field]: e.target.value };
      return { ...prev, veiculos: novosVeiculos };
    });
  };

  const addVeiculo = () => {
    setCliente((prev) => ({
      ...prev,
      veiculos: [...prev.veiculos, { placa: "", modelo: "", ano: "", cor: "", chassi: "" }],
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
            style={{ WebkitTextFillColor: "white" }}
          />
        </div>

        {/* Campos de endereço */}
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

        <div className="space-y-6">
          <h3 className="text-lg font-semibold mt-6">Informações do Veículo</h3>

          {cliente.veiculos.map((veiculo, index) => (
            <div
              key={index}
              className="border-t border-gray-600 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Label className="col-span-full font-medium">Veículo {index + 1}</Label>
              <Input
                placeholder="Placa (Ex: ABC-1234)"
                value={veiculo.placa}
                onChange={(e) => handleVeiculoChange(e, "placa", index)}
                className={inputClass}
                spellCheck={false}
                autoComplete="off"
                style={{ WebkitTextFillColor: "white" }}
              />
              <Input
                placeholder="Modelo (Ex: Honda CG 160)"
                value={veiculo.modelo}
                onChange={(e) => handleVeiculoChange(e, "modelo", index)}
                className={inputClass}
                spellCheck={false}
                autoComplete="off"
                style={{ WebkitTextFillColor: "white" }}
              />
              <Input
                placeholder="Ano (Ex: 2020)"
                value={veiculo.ano}
                onChange={(e) => handleVeiculoChange(e, "ano", index)}
                className={inputClass}
                spellCheck={false}
                autoComplete="off"
                style={{ WebkitTextFillColor: "white" }}
              />
              <Input
                placeholder="Cor (Ex: Vermelha)"
                value={veiculo.cor}
                onChange={(e) => handleVeiculoChange(e, "cor", index)}
                className={inputClass}
                spellCheck={false}
                autoComplete="off"
                style={{ WebkitTextFillColor: "white" }}
              />
              <Input
                placeholder="Chassi (Ex: 9C2KC1670ER000001)"
                value={veiculo.chassi}
                onChange={(e) => handleVeiculoChange(e, "chassi", index)}
                className={inputClass + " sm:col-span-2"}
                spellCheck={false}
                autoComplete="off"
                style={{ WebkitTextFillColor: "white" }}
              />
            </div>
          ))}

          <Button onClick={addVeiculo} className="w-full bg-gray-600 hover:bg-gray-700">
            + Adicionar Veículo
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