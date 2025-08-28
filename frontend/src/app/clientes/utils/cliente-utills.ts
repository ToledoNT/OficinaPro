import { Cliente, Veiculo } from "@/app/interfaces/clientes-interface";

export const criarClienteVazio = (): Cliente => ({
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
  });
  
  export const normalizarCliente = (cliente: Cliente): Cliente => ({
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
  });
  
  export const filtrarVeiculosVazios = (veiculos: Veiculo[]): Veiculo[] => {
    return veiculos.filter(
      (v) =>
        (v.placa?.trim() ?? "") !== "" ||
        (v.modelo?.trim() ?? "") !== "" ||
        (v.ano?.trim() ?? "") !== "" ||
        (v.cor?.trim() ?? "") !== "" ||
        (v.chassi?.trim() ?? "") !== ""
    );
  };