import { Cliente } from "@/app/interfaces/clientes-interface";
import { Button } from "../components/ui/button";

interface ClienteModalProps {
  cliente: Cliente;
  onFechar: () => void;
}

export const ClienteModal = ({ cliente, onFechar }: ClienteModalProps) => {
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
};