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
  id: string;  
  nome: string;
  telefone: string;
  isWhatsapp: boolean;
  cpf: string;
  endereco: Endereco;
  observacoes: string;
  veiculos: Veiculo[];
}


export interface IRegisterClienteData {
  nome: string;
  telefone: string;
  isWhatsapp: boolean;
  cpf: string;
  endereco: Endereco;
  observacoes: string;
  veiculos: Veiculo[];
}

export interface IUpdateClienteData {
  nome?: string;
  telefone?: string;
  isWhatsapp?: boolean;
  cpf?: string;
  endereco?: Partial<Endereco>;
  observacoes?: string;
  veiculos?: Veiculo[];
}