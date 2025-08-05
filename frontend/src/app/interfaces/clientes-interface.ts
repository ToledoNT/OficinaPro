export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado?: string;
  cep?: string;
}

export interface Veiculo {
  placa: string;
  modelo: string;
  ano: string;
  cor: string;
  chassi: string;
}

export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  whatsapp: boolean;
  cpf: string;
  endereco: Endereco;
  observacoes: string;
  veiculos: Veiculo[];
}

export interface IRegisterClienteData {
  nome: string;
  telefone: string;
  whatsapp: boolean;
  cpf: string;
  endereco: Endereco;
  observacoes: string;
  veiculos: Veiculo[];
}