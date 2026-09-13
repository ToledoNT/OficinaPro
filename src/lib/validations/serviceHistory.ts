import { z } from 'zod';

export const serviceHistorySchema = z.object({
  vehicleId: z.string().min(1, 'Veículo obrigatório.'),
  date: z.string().min(1, 'Informe a data do serviço.'),
  mileage: z.coerce.number().min(0, 'Quilometragem inválida.'),
  problemReported: z.string().min(3, 'Descreva a queixa ou solicitação do cliente.'),
  diagnosis: z.string().min(3, 'Informe o diagnóstico técnico ou avaliação realizada.'),
  servicesDone: z.string().min(3, 'Descreva os serviços executados no veículo.'),
  partsUsed: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  totalAmount: z.coerce.number().min(0, 'O valor total deve ser positivo.'),
  responsibleName: z.string().min(2, 'Informe o nome do mecânico responsável.'),
});

export type ServiceHistoryFormData = z.infer<typeof serviceHistorySchema>;
