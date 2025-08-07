import { IUpdateClient } from "../../interfaces/cliente/update-cliente-interface";

export class UpdateClientModel implements IUpdateClient {
  id: string;
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
  veiculos?: {
    placa?: string;
    modelo: string;
    ano?: string;
    cor?: string;
    chassi?: string;
  }[];

  constructor(data: Partial<IUpdateClient> & { id: string }) {
    this.id = data.id;
    this.nome = data.nome;
    this.telefone = data.telefone;
    this.isWhatsapp = data.isWhatsapp;
    this.cpf = data.cpf;
    this.email = data.email;
    this.endereco = data.endereco;
    this.observacoes = data.observacoes;
    this.dataCadastro = data.dataCadastro;
    this.veiculos = data.veiculos?.map((v) => ({
      placa: v.placa,
      modelo: v.modelo,
      ano: v.ano,
      cor: v.cor,
      chassi: v.chassi,
    }));
  }

  toPayload(): Partial<IUpdateClient> {
    const payload: Partial<IUpdateClient> = {};

    if (this.nome !== undefined) payload.nome = this.nome;
    if (this.telefone !== undefined) payload.telefone = this.telefone;
    if (this.isWhatsapp !== undefined) payload.isWhatsapp = this.isWhatsapp;
    if (this.cpf !== undefined) payload.cpf = this.cpf;
    if (this.email !== undefined) payload.email = this.email;
    if (this.endereco !== undefined) payload.endereco = { ...this.endereco };
    if (this.observacoes !== undefined) payload.observacoes = this.observacoes;
    if (this.dataCadastro !== undefined) payload.dataCadastro = this.dataCadastro;

    if (this.veiculos?.length) {
      const filteredVeiculos = this.veiculos.filter((v) => {
        const isEmpty =
          (!v.placa || v.placa.trim() === "") &&
          (!v.modelo || v.modelo.trim() === "") &&
          (!v.ano || v.ano.trim() === "") &&
          (!v.cor || v.cor.trim() === "") &&
          (!v.chassi || v.chassi.trim() === "");
        return !isEmpty;
      });

      if (filteredVeiculos.length > 0) {
        payload.veiculos = filteredVeiculos.map((v) => ({
          placa: v.placa,
          modelo: v.modelo,
          ano: v.ano,
          cor: v.cor,
          chassi: v.chassi,
        }));
      }
    }

    return payload;
  }
}