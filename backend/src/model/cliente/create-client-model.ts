import { Veiculo } from "@prisma/client";

export class CreateClientModel {
  id?: string;
  nome: string;
  telefone: string;
  isWhatsapp: boolean;
  cpf: string;
  email?: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  observacoes: string;
  dataCadastro: Date;
  veiculos?: Veiculo[];

  constructor(data: Partial<CreateClientModel>) {
    if (data.id) this.id = data.id;
    this.nome = data.nome ?? "";
    this.telefone = data.telefone ?? "";
    this.isWhatsapp = data.isWhatsapp ?? false;
    this.cpf = data.cpf ?? "";
    this.email = data.email ?? "";

    this.endereco = {
      rua: data.endereco?.rua ?? "",
      numero: data.endereco?.numero ?? "",
      bairro: data.endereco?.bairro ?? "",
      cidade: data.endereco?.cidade ?? "",
      estado: data.endereco?.estado ?? "",
      cep: data.endereco?.cep ?? "",
    };

    this.observacoes = data.observacoes ?? "";
    this.dataCadastro = data.dataCadastro ?? new Date();

    if (Array.isArray(data.veiculos)) {
      const filtered = data.veiculos.filter(
        (v) =>
          (v.placa?.trim() ?? "") !== "" ||
          (v.modelo?.trim() ?? "") !== "" ||
          (v.ano?.trim() ?? "") !== "" ||
          (v.cor?.trim() ?? "") !== "" ||
          (v.chassi?.trim() ?? "") !== ""
      );
      if (filtered.length > 0) {
        this.veiculos = filtered.map((v) => ({
          placa: v.placa ?? "",
          modelo: v.modelo ?? "",
          ano: v.ano ?? "",
          cor: v.cor ?? "",
          chassi: v.chassi ?? "",
        }));
      }
    }
  }

  /**
   * Retorna um objeto plano, sem funções, para enviar ao Prisma.
   */
  toPayload() {
    const payload: Record<string, any> = {
      nome: this.nome,
      telefone: this.telefone,
      isWhatsapp: this.isWhatsapp,
      cpf: this.cpf,
      email: this.email,
      endereco: { ...this.endereco }, // spread para garantir objeto simples
      observacoes: this.observacoes,
      dataCadastro: this.dataCadastro,
    };

    if (this.veiculos && this.veiculos.length > 0) {
      payload.veiculos = this.veiculos.map((v) => ({
        placa: v.placa,
        modelo: v.modelo,
        ano: v.ano,
        cor: v.cor,
        chassi: v.chassi,
      }));
    }

    return payload;
  }
}