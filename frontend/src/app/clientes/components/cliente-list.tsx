import { Cliente } from "@/app/interfaces/clientes-interface";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ClienteCard } from "./cliente-card";

interface ClienteListProps {
  clientes: Cliente[];
  filtro: string;
  setFiltro: (value: string) => void;
  onAddCliente: () => void;
  onViewCliente: (cliente: Cliente) => void;
  onEditCliente: (cliente: Cliente) => void;
  onDeleteCliente: (id: string) => void;
  onBackToHome: () => void;
}

export const ClienteList = ({
  clientes,
  filtro,
  setFiltro,
  onAddCliente,
  onViewCliente,
  onEditCliente,
  onDeleteCliente,
  onBackToHome,
}: ClienteListProps) => {
  const inputClass = "bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Button className="bg-blue-600 hover:bg-blue-700">
          Ver Clientes
        </Button>

        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={onAddCliente}
        >
          Cadastrar Cliente
        </Button>

        <Button
          variant="outline"
          className="border border-gray-500 text-gray-200 hover:bg-gray-700"
          onClick={onBackToHome}
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
        {clientes.length === 0 ? (
          <p>Nenhum cliente encontrado.</p>
        ) : (
          clientes.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              onView={() => onViewCliente(cliente)}
              onEdit={() => onEditCliente(cliente)}
              onDelete={() => onDeleteCliente(cliente.id)}
            />
          ))
        )}
      </div>
    </>
  );
};