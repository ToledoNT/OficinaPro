import { z } from 'zod';

export const workOrderSchema = z.object({
  budgetId: z.string().optional(),
  clientId: z.string().min(1, 'Cliente é obrigatório.'),
  vehicleId: z.string().min(1, 'Veículo é obrigatório.'),
  problemReported: z.string().min(3, 'Descrição do problema é obrigatória.'),
  diagnosis: z.string().optional(),
  servicesDone: z.string().optional(),
  partsUsed: z.string().optional(),
  notes: z.string().optional(),
  mileageIn: z.number().int().min(0, 'Quilometragem inválida.'),
  mileageOut: z.number().int().min(0).optional(),
  responsibleName: z.string().optional(),
  estimatedAt: z.string().optional(),
  totalAmount: z.number().min(0).default(0),
});

export type WorkOrderFormData = z.infer<typeof workOrderSchema>;
