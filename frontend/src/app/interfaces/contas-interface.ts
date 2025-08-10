import { Conta } from "../contas/components/conta-form";

export interface ContaCardProps {
    conta: Conta;
    formatarValor: (valor: string) => string;
    onEditar: (conta: Conta) => void;
    onExcluir: (id: number) => void;
  }