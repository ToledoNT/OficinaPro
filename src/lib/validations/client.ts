import { z } from 'zod';

export const clientSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .max(120, 'O nome deve ter no máximo 120 caracteres.'),
  cpf: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const clean = val.replace(/\D/g, '');
      return clean.length === 11;
    }, 'Se informado, o CPF deve conter 11 dígitos numéricos.'),
  phone: z
    .string()
    .min(10, 'Telefone inválido.')
    .max(16, 'Telefone inválido.')
    .refine((val) => {
      const clean = val.replace(/\D/g, '');
      return clean.length >= 10 && clean.length <= 11;
    }, 'Informe um telefone válido com DDD (10 ou 11 dígitos).'),
  email: z
    .string()
    .email('E-mail inválido.')
    .optional()
    .or(z.literal('')),
  address: z.string().max(255, 'Endereço muito longo.').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Observações muito longas.').optional().or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientSchema>;
