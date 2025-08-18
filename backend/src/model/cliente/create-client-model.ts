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
      const enderecoFiltrado: Record<string, string> = {};
      Object.entries(data.endereco).forEach(([key, value]) => {
        if (value?.trim()) enderecoFiltrado[key] = value;
      });
      if (Object.keys(enderecoFiltrado).length > 0) this.endereco = enderecoFiltrado as any;
    }

    this.observacoes = data.observacoes?.trim() || undefined;
    this.dataCadastro = data.dataCadastro ?? new Date();

    if (Array.isArray(data.veiculos)) {
      const veiculosFiltrados = data.veiculos
        .map(v => {
          const obj: Partial<Veiculo> = {};
          if (v.placa?.trim()) obj.placa = v.placa;
          if (v.modelo?.trim()) obj.modelo = v.modelo;
          if (v.ano?.trim()) obj.ano = v.ano;
          if (v.cor?.trim()) obj.cor = v.cor;
          if (v.chassi?.trim()) obj.chassi = v.chassi;
          return obj;
        })
        .filter(v => Object.keys(v).length > 0);

      if (veiculosFiltrados.length > 0) this.veiculos = veiculosFiltrados as Veiculo[];
    }
  }

  toPayload() {
    const payload: Record<string, any> = {};

    if (this.nome) payload.nome = this.nome;
    if (this.telefone) payload.telefone = this.telefone;
    if (this.isWhatsapp !== undefined) payload.isWhatsapp = this.isWhatsapp;
    if (this.cpf) payload.cpf = this.cpf;
    if (this.email) payload.email = this.email;
    if (this.endereco) payload.endereco = this.endereco;
    if (this.observacoes) payload.observacoes = this.observacoes;
    if (this.dataCadastro) payload.dataCadastro = this.dataCadastro;
    if (this.veiculos && this.veiculos.length > 0) payload.veiculos = this.veiculos;

    return payload;
  }
}