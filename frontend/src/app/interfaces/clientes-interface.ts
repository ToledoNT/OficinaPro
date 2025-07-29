export interface Moto {
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
    endereco: string;
    observacoes: string;
    motos: Moto[];
  }
  