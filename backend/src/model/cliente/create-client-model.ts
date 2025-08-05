export class CreateClientModel {
  id?: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  cpf: string;
  endereco: string;
  observacoes: string;

  constructor(data: Partial<CreateClientModel>) {
    if (data.id) this.id = data.id; 
    this.nome = data.nome ?? '';
    this.telefone = data.telefone ?? '';
    this.whatsapp = data.whatsapp ?? '';
    this.cpf = data.cpf ?? '';
    this.endereco = data.endereco ?? '';
    this.observacoes = data.observacoes ?? '';
  }
}
