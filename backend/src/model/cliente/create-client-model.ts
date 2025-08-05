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
  dataCadastro?: Date;

  constructor(data: Partial<CreateClientModel>) {
    if (data.id) this.id = data.id;
    this.nome = data.nome ?? '';
    this.telefone = data.telefone ?? '';
    this.isWhatsapp = data.isWhatsapp ?? false;
    this.cpf = data.cpf ?? '';
    this.email = data.email ?? '';

    this.endereco = {
      rua: data.endereco?.rua ?? '',
      numero: data.endereco?.numero ?? '',
      bairro: data.endereco?.bairro ?? '',
      cidade: data.endereco?.cidade ?? '',
      estado: data.endereco?.estado ?? '',
      cep: data.endereco?.cep ?? ''
    };

    this.observacoes = data.observacoes ?? '';
    this.dataCadastro = data.dataCadastro ?? new Date();
  }
}