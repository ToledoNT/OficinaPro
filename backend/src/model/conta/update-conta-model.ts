import { IUpdateConta } from "../../interfaces/contas/update-conta-interface";

export class UpdateContaModel implements IUpdateConta {
  dataPagamento?: string;
  clienteId?: string | null;
  descricao?: string;
  categoria?: string;
  tipo?: 'A pagar' | 'A receber';
  valor?: string;
  pago?: boolean;
  observacoes?: string;
  temServico?: boolean;
  servicoId?: string;  // Agora o servicoId é opcional
  servicoVinculado?: string;

  constructor(data: Partial<IUpdateConta>) {
    this.dataPagamento = data.dataPagamento;
    this.clienteId = data.clienteId ?? null;
    this.descricao = data.descricao;
    this.categoria = data.categoria;
    this.tipo = data.tipo;
    this.valor = data.valor;
    this.pago = data.pago;
    this.observacoes = data.observacoes;
    this.temServico = data.temServico;
    this.servicoVinculado = data.servicoVinculado;
    this.servicoId = data.servicoId;  // Atribuindo o servicoId
  }

  toPayload(): Partial<IUpdateConta> {
    const payload: Partial<IUpdateConta> = {};

    if (this.dataPagamento !== undefined) payload.dataPagamento = this.dataPagamento;
    if (this.clienteId !== undefined) payload.clienteId = this.clienteId;
    if (this.descricao !== undefined) payload.descricao = this.descricao;
    if (this.categoria !== undefined) payload.categoria = this.categoria;
    if (this.tipo !== undefined) payload.tipo = this.tipo;
    if (this.valor !== undefined) payload.valor = this.valor;
    if (this.pago !== undefined) payload.pago = this.pago;
    if (this.observacoes !== undefined) payload.observacoes = this.observacoes;
    if (this.temServico !== undefined) payload.temServico = this.temServico;
    if (this.servicoVinculado !== undefined) payload.servicoVinculado = this.servicoVinculado;
    if (this.servicoId !== undefined) payload.servicoId = this.servicoId;  // Incluindo o servicoId no payload

    return payload;
  }
}
