import { Veiculo } from "@prisma/client";

export class CreateClientModel {
  id?: string;
  nome?: string;
  telefone?: string;
  isWhatsapp?: boolean;
  cpf?: string;
  email?: string;
  endereco?: {
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  observacoes?: string;
  dataCadastro?: Date;
  veiculos?: Veiculo[];

  constructor(data: Partial<CreateClientModel>) {
    this.id = data.id;
    this.nome = data.nome?.trim() || undefined;
    this.telefone = data.telefone?.trim() || undefined;
    this.isWhatsapp = data.isWhatsapp ?? undefined;
    this.cpf = data.cpf?.trim() || undefined;
    this.email = data.email?.trim() || undefined;

    if (data.endereco) {
      this.endereco = {
        rua: data.endereco.rua?.trim() || "",
        numero: data.endereco.numero?.trim() || "0",
        bairro: data.endereco.bairro?.trim() || "",
        cidade: data.endereco.cidade?.trim() || "",
        estado: data.endereco.estado?.trim() || "",
        cep: data.endereco.cep?.trim() || ""
      };
    }

    this.observacoes = data.observacoes?.trim() || "";
    this.dataCadastro = data.dataCadastro ?? new Date();

    if (Array.isArray(data.veiculos)) {
      const veiculosFiltrados = data.veiculos
        .map(v => ({
          placa: v.placa?.trim() || "",
          modelo: v.modelo?.trim() || "",
          ano: v.ano?.trim() || "",
          cor: v.cor?.trim() || "",
          chassi: v.chassi?.trim() || ""
        }))
        .filter(v => Object.keys(v).length > 0);

      if (veiculosFiltrados.length > 0) this.veiculos = veiculosFiltrados as Veiculo[];
    }
  }

  toPayload() {
    const payload: Record<string, any> = {};

    payload.nome = this.nome || "";
    payload.telefone = this.telefone || "";
    payload.isWhatsapp = this.isWhatsapp ?? false;
    payload.cpf = this.cpf || "";
    if (this.email) payload.email = this.email;

    // endereços e veículos como objetos diretos
    if (this.endereco) {
      payload.endereco = { ...this.endereco };
    }

    payload.observacoes = this.observacoes;
    payload.dataCadastro = this.dataCadastro;

    if (this.veiculos && this.veiculos.length > 0) {
      payload.veiculos = [...this.veiculos];
    }

    return payload;
  }
}