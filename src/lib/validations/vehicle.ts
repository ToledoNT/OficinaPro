import { z } from 'zod';

export const vehicleSchema = z.object({
  type: z.enum(['CARRO', 'MOTO']),
  brand: z.string().optional().or(z.literal('')),
  model: z.string().optional().or(z.literal('')),
  year: z.coerce
    .number()
    .int('Ano inválido.')
    .min(1900, 'Ano deve ser maior que 1900.')
    .max(new Date().getFullYear() + 2, 'Ano inválido.')
    .optional()
    .or(z.literal('')),
  plate: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
      return clean.length === 7;
    }, 'Se informada, a placa deve conter 7 caracteres alfanuméricos.'),
  mileage: z.coerce.number().min(0, 'Quilometragem deve ser maior ou igual a 0.').default(0).optional(),
  color: z.string().optional().or(z.literal('')),
  chassis: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  clientId: z.string().min(1, 'Selecione o cliente proprietário do veículo.'),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
