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

    // Campos simples
    if (data.nome?.trim()) this.nome = data.nome.trim();
    if (data.telefone?.trim()) this.telefone = data.telefone.trim();
    if (data.isWhatsapp !== undefined) this.isWhatsapp = data.isWhatsapp;
    if (data.cpf?.trim()) this.cpf = data.cpf.trim();
    if (data.email?.trim()) this.email = data.email.trim();
    if (data.observacoes?.trim()) this.observacoes = data.observacoes.trim();
    if (data.dataCadastro) this.dataCadastro = data.dataCadastro;

    // Endereço
    if (data.endereco) {
      const enderecoFiltrado: Partial<IUpdateClient["endereco"]> = {};
      Object.entries(data.endereco).forEach(([key, value]) => {
        if (value?.trim()) {
          enderecoFiltrado[key as keyof typeof enderecoFiltrado] = value;
        }
      });
      if (Object.keys(enderecoFiltrado).length > 0) this.endereco = enderecoFiltrado;
    }

    // Veículos
    if (Array.isArray(data.veiculos)) {
      const veiculosFiltrados = data.veiculos
        .map(v => {
          if (!v.modelo?.trim()) return null; // modelo obrigatório
          const veiculo: { modelo: string; placa?: string; ano?: string; cor?: string; chassi?: string } = {
            modelo: v.modelo.trim(),
          };
          if (v.placa?.trim()) veiculo.placa = v.placa.trim();
          if (v.ano?.trim()) veiculo.ano = v.ano.trim();
          if (v.cor?.trim()) veiculo.cor = v.cor.trim();
          if (v.chassi?.trim()) veiculo.chassi = v.chassi.trim();
          return veiculo;
        })
        .filter((v): v is NonNullable<typeof v> => v !== null);

      if (veiculosFiltrados.length > 0) this.veiculos = veiculosFiltrados;
    }
  }

  toPayload(): Partial<IUpdateClient> {
    const payload: Partial<IUpdateClient> = {};

    if (this.nome) payload.nome = this.nome;
    if (this.telefone) payload.telefone = this.telefone;
    if (this.isWhatsapp !== undefined) payload.isWhatsapp = this.isWhatsapp;
    if (this.cpf) payload.cpf = this.cpf;
    if (this.email) payload.email = this.email;
    if (this.endereco && Object.keys(this.endereco).length > 0) payload.endereco = { ...this.endereco };
    if (this.observacoes) payload.observacoes = this.observacoes;
    if (this.dataCadastro) payload.dataCadastro = this.dataCadastro;

    if (this.veiculos && this.veiculos.length > 0) {
      payload.veiculos = this.veiculos.map(v => {
        const veiculo: any = { modelo: v.modelo };
        if (v.placa) veiculo.placa = v.placa;
        if (v.ano) veiculo.ano = v.ano;
        if (v.cor) veiculo.cor = v.cor;
        if (v.chassi) veiculo.chassi = v.chassi;
        return veiculo;
      });
    }

    return payload;
  }
}