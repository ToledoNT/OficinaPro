export class CreateContaModel {
  id?: number;
  dataPagamento: string;
  clienteId?: string | null; // Pode ser null
  cliente: string;
  descricao: string;
  categoria: string;
  tipo: 'A pagar' | 'A receber';
  valor: string;
  pago: boolean;
  observacoes: string;
  temServico: boolean;
  servicoVinculado?: string; // Agora servicoVinculado é opcional
  servicoId?: string; // Adicionando servicoId

  constructor(data: Partial<CreateContaModel>) {
    this.id = data.id;
    this.dataPagamento = data.dataPagamento ?? new Date().toISOString(); // Se não passar, coloca data atual
    this.clienteId = data.clienteId ?? null; // Permite null
    this.cliente = data.cliente ?? 'Cliente Desconhecido'; // Se não passar, valor padrão
    this.descricao = data.descricao ?? 'Descrição não fornecida'; // Valor padrão
    this.categoria = data.categoria ?? 'Serviço'; // Valor padrão
    this.tipo = data.tipo ?? 'A pagar'; // Se não passar, 'A pagar' como padrão
    this.valor = data.valor ?? '0'; // Valor padrão
    this.pago = data.pago ?? false; // Padrão como não pago
    this.observacoes = data.observacoes ?? ''; // Observação padrão vazia
    this.temServico = data.temServico ?? true; // Assumindo que "temServico" é verdadeiro por padrão
    this.servicoVinculado = data.servicoVinculado ?? ''; // Serviço vinculado, pode ser vazio
    this.servicoId = data.servicoId ?? undefined; // Garantir que servicoId seja undefined se não passado
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
