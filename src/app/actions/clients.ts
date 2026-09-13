'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/prisma';
import { clientSchema, ClientFormData } from '@/lib/validations/client';
import { getTenantContext } from '@/lib/auth';

export async function createClient(data: ClientFormData) {
  try {
    const tenant = await getTenantContext();
    const validated = clientSchema.parse(data);

    const cleanCpf = validated.cpf && validated.cpf.trim() !== '' ? validated.cpf.trim() : null;

    if (cleanCpf) {
      const existing = await prisma.client.findFirst({
        where: {
          workshopId: tenant.workshopId,
          cpf: cleanCpf,
        },
      });

      if (existing) {
        return { success: false, error: 'Já existe um cliente cadastrado com este CPF nesta oficina.' };
      }
    }

    const newClient = await prisma.client.create({
      data: {
        workshopId: tenant.workshopId,
        name: validated.name.trim(),
        cpf: cleanCpf,
        phone: validated.phone.trim(),
        email: validated.email?.trim() || null,
        address: validated.address?.trim() || null,
        notes: validated.notes?.trim() || null,
      },
    });

    safeRevalidatePath('/clientes');
    safeRevalidatePath('/');
    return { success: true, client: newClient };
  } catch (err: unknown) {
    console.error('Erro ao cadastrar cliente:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao cadastrar cliente.',
    };
  }
}

export async function updateClient(id: string, data: ClientFormData) {
  try {
    const tenant = await getTenantContext();
    const validated = clientSchema.parse(data);
    const cleanCpf = validated.cpf && validated.cpf.trim() !== '' ? validated.cpf.trim() : null;

    const existingClient = await prisma.client.findFirst({
      where: { id, workshopId: tenant.workshopId },
    });

    if (!existingClient) {
      return { success: false, error: 'Cliente não encontrado nesta oficina.' };
    }

    if (cleanCpf) {
      const existingWithCpf = await prisma.client.findFirst({
        where: {
          workshopId: tenant.workshopId,
          cpf: cleanCpf,
          NOT: { id },
        },
      });

      if (existingWithCpf) {
        return { success: false, error: 'Este CPF já está sendo utilizado por outro cliente nesta oficina.' };
      }
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        name: validated.name.trim(),
        cpf: cleanCpf,
        phone: validated.phone.trim(),
        email: validated.email?.trim() || null,
        address: validated.address?.trim() || null,
        notes: validated.notes?.trim() || null,
      },
    });

    safeRevalidatePath('/clientes');
    safeRevalidatePath(`/clientes/${id}`);
    safeRevalidatePath('/');
    return { success: true, client: updated };
  } catch (err: unknown) {
    console.error('Erro ao atualizar cliente:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao atualizar cliente.',
    };
  }
}

export async function deleteClient(id: string) {
  try {
    const tenant = await getTenantContext();

    const clientWithRelations = await prisma.client.findFirst({
      where: { id, workshopId: tenant.workshopId },
      include: {
        vehicles: {
          include: {
            _count: {
              select: { history: true },
            },
          },
        },
        _count: {
          select: { budgets: true },
        },
      },
    });

    if (!clientWithRelations) {
      return { success: false, error: 'Cliente não encontrado nesta oficina.' };
    }

    const totalServices = clientWithRelations.vehicles.reduce(
      (acc, v) => acc + v._count.history,
      0
    );

    if (totalServices > 0) {
      return {
        success: false,
        error: `Não é possível excluir este cliente porque existem ${totalServices} registro(s) de serviço vinculados aos seus veículos. Mantenha o cadastro para fins de histórico e garantia.`,
      };
    }

    await prisma.client.delete({
      where: { id },
    });

    safeRevalidatePath('/clientes');
    safeRevalidatePath('/veiculos');
    safeRevalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    console.error('Erro ao excluir cliente:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao excluir cliente.',
    };
  }
}
