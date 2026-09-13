import { z } from 'zod';

export const budgetItemSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['SERVICO', 'PECA']),
  description: z.string().min(2, 'Informe a descrição do item (peça ou serviço).'),
  quantity: z.coerce.number().min(0.01, 'Quantidade mínima é 0.01.'),
  unitPrice: z.coerce.number().min(0, 'Valor unitário não pode ser negativo.'),
  discount: z.coerce.number().min(0, 'Desconto não pode ser negativo.').default(0),
  subtotal: z.coerce.number(),
});

export const budgetSchema = z.object({
  clientId: z.string().min(1, 'Selecione o cliente.'),
  vehicleId: z.string().min(1, 'Selecione o veículo.'),
  date: z.string().min(1, 'Informe a data do orçamento.'),
  expirationDate: z.string().min(1, 'Informe a data de validade.'),
  status: z.enum(['RASCUNHO', 'ENVIADO', 'APROVADO', 'RECUSADO', 'EXPIRADO']),
  notes: z.string().optional().or(z.literal('')),
  subtotal: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0),
  items: z.array(budgetItemSchema).min(1, 'Adicione pelo menos um item (serviço ou peça) ao orçamento.'),
});

export type BudgetItemFormData = z.infer<typeof budgetItemSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
