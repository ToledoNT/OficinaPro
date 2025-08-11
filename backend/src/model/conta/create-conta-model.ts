export class CreateContaModel {
    id?: number;
    dataPagamento: string;
    clienteId?: number;
    cliente: string;
    descricao: string;
    categoria: string;
    tipo: 'A pagar' | 'A receber';
    valor: string;
    pago: boolean;
    observacoes: string;
    temServico: boolean;
    servicoVinculado: string;
  
    constructor(data: Partial<CreateContaModel>) {
      if (data.id) this.id = data.id;
  
      this.dataPagamento = data.dataPagamento ?? '';
      this.clienteId = data.clienteId ?? undefined;
      this.cliente = data.cliente ?? '';
      this.descricao = data.descricao ?? '';
      this.categoria = data.categoria ?? 'Serviço';
      this.tipo = data.tipo ?? 'A pagar';
      this.valor = data.valor ?? '0';
      this.pago = data.pago ?? false;
      this.observacoes = data.observacoes ?? '';
      this.temServico = data.temServico ?? false;
      this.servicoVinculado = data.servicoVinculado ?? '';
    }
  
    toPayload() {
      const payload: Record<string, any> = {
        dataPagamento: this.dataPagamento,
        clienteId: this.clienteId,
        cliente: this.cliente,
        descricao: this.descricao,
        categoria: this.categoria,
        tipo: this.tipo,
        valor: this.valor,
        pago: this.pago,
        observacoes: this.observacoes,
        temServico: this.temServico,
        servicoVinculado: this.servicoVinculado,
      };
  
      if (this.id !== undefined) {
        payload.id = this.id;
      }
  
      return payload;
    }
  }