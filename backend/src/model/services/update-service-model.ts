import { IUpdateService } from "../../interfaces/services/update-service-interface";

export class UpdateServiceModel {
  id: string;
  clienteId?: string;
  veiculo?: string;
  dataCadastro?: Date; 
  descricao?: string;
  finalizado?: boolean;
  status?: string;
  observacoes?: string;
  prioridade?: string;
  valor?: string;
  pago?: boolean;

  constructor(data: Partial<UpdateServiceModel> & { id: string }) {
    this.id = data.id;
    this.clienteId = data.clienteId;
    this.veiculo = data.veiculo;
    this.dataCadastro = data.dataCadastro;
    this.descricao = data.descricao;
    this.finalizado = data.finalizado;
    this.status = data.status;
    this.observacoes = data.observacoes;
    this.prioridade = data.prioridade;
    this.valor = data.valor;
    this.pago = data.pago;
  }

  toPayload(): Partial<IUpdateService> {
    const payload: Partial<IUpdateService> = {};

    if (this.clienteId !== undefined) payload.clienteId = this.clienteId;
    if (this.veiculo !== undefined) payload.veiculo = this.veiculo;
    if (this.dataCadastro !== undefined) payload.dataCadastro = this.dataCadastro; 
    if (this.descricao !== undefined) payload.descricao = this.descricao;
    if (this.finalizado !== undefined) payload.finalizado = this.finalizado;
    if (this.status !== undefined) payload.status = this.status;
    if (this.observacoes !== undefined) payload.observacoes = this.observacoes;
    if (this.prioridade !== undefined) payload.prioridade = this.prioridade;
    if (this.valor !== undefined) payload.valor = this.valor;
    if (this.pago !== undefined) payload.pago = this.pago;

    return payload;
  }
}