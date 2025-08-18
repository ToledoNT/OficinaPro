import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Cliente } from "@/app/interfaces/clientes-interface";

interface ClienteCardProps {
  cliente: Cliente;
  onView: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void; 
  loading?: boolean;
}
export const ClienteCard = ({
  cliente,
  onView,
  onEdit,
  onDelete,
  loading = false,
}: ClienteCardProps) => {
  return (
    <Card className="bg-[#1e293b] border border-gray-700">
      <CardContent className="p-4 text-gray-300">
        <h3 className="text-lg font-semibold mb-1 text-white">{cliente.nome}</h3>
        <p>{cliente.telefone}</p>
        {cliente.isWhatsapp && (
          <span className="text-green-400 text-xs">(WhatsApp)</span>
        )}

        <ul className="mt-2 text-sm list-disc list-inside">
          {(cliente.veiculos ?? []).length === 0 ? (
            <li>Nenhum veículo cadastrado</li>
          ) : (
            cliente.veiculos!.map((v, i) => (
              <li key={i}>
                {v.modelo} ({v.placa})
              </li>
            ))
          )}
        </ul>

        <div className="mt-4 flex justify-center gap-3">
          <Button
            variant="outline"
            className="text-yellow-400 border-yellow-400 hover:bg-yellow-600 hover:text-white text-xs px-3"
            onClick={() => {
              console.log(`Botão Ver clicado para cliente ID: ${cliente.id}`);
              onView();
            }}
            disabled={loading}
          >
            Ver
          </Button>

          <Button
            className="bg-blue-500 text-xs px-3"
            onClick={() => {
              console.log(`Botão Editar clicado para cliente ID: ${cliente.id}`);
              onEdit();
            }}
            disabled={loading}
          >
            Editar
          </Button>

          <Button
  variant="outline"
  className="text-red-500 border-red-500 hover:bg-red-600 hover:text-white text-xs px-3"
  onClick={() => {
    console.log('[DEBUG] Botão deletar clicado - ID:', cliente.id);
    onDelete(cliente.id);
  }}
  disabled={loading}
>
  {loading ? "Deletando..." : "Deletar"}
</Button>
        </div>
      </CardContent>
    </Card>
  );
};