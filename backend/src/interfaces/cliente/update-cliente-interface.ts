export interface IUpdateClient {
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
}