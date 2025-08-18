export class CreateServiceModel {
  id?: string;
  clienteId: string;
  veiculo?: string;
  dataCadastro?: Date; 

  descricao: string;
  finalizado: boolean;
  status: string;
  observacoes: string;
  prioridade?: string;
  valor?: string;
  pago?: boolean;

  constructor(data: Partial<CreateServiceModel>) {
    if (data.id) this.id = data.id;
    this.clienteId = data.clienteId ?? "";
    this.veiculo = data.veiculo ?? "";
    this.dataCadastro = data.dataCadastro ?? new Date(); 
    this.descricao = data.descricao ?? "";
    this.finalizado = data.finalizado ?? false;
    this.status = data.status ?? "Em fila";
    this.observacoes = data.observacoes ?? "";
    this.prioridade = data.prioridade ?? "Média";
    this.valor = data.valor ?? "";
    this.pago = data.pago ?? false;
  }

  toPayload() {
    return {
      clienteId: this.clienteId,
      veiculo: this.veiculo,
      dataCadastro: this.dataCadastro, 
      descricao: this.descricao,
      finalizado: this.finalizado,
      status: this.status,
      observacoes: this.observacoes,
      prioridade: this.prioridade,
      valor: this.valor,
      pago: this.pago,
    };
  }
}