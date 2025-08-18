export class CreateContaModel {
  id?: number;
  dataPagamento: string;
  clienteId?: string | null; 
  cliente: string;
  descricao: string;
  categoria: string;
  tipo: 'A pagar' | 'A receber';
  valor: string;
  pago: boolean;
  observacoes: string;
  temServico: boolean;
  servicoVinculado?: string; 
  servicoId?: string; 

  constructor(data: Partial<CreateContaModel>) {
    this.id = data.id;
    this.dataPagamento = data.dataPagamento ?? new Date().toISOString(); 
    this.clienteId = data.clienteId ?? null; 
    this.cliente = data.cliente ?? 'Cliente Desconhecido'; 
    this.descricao = data.descricao ?? 'Descrição não fornecida'; 
    this.categoria = data.categoria ?? 'Serviço'; 
    this.tipo = data.tipo ?? 'A pagar'; 
    this.valor = data.valor ?? '0'; 
    this.pago = data.pago ?? false; 
    this.observacoes = data.observacoes ?? ''; 
    this.temServico = data.temServico ?? true; 
    this.servicoVinculado = data.servicoVinculado ?? ''; 
    this.servicoId = data.servicoId ?? undefined; 
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
    };

    if (this.servicoVinculado && this.servicoVinculado.trim() !== '') {
      payload.servicoVinculado = this.servicoVinculado;
    }

    if (this.servicoId !== undefined && this.servicoId !== null) {
      payload.servicoId = this.servicoId;
    }

    if (this.id !== undefined) {
      payload.id = this.id;
    }

    return payload;
  }
}
