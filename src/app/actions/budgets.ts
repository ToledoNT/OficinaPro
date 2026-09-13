'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/prisma';
import { budgetSchema, BudgetFormData } from '@/lib/validations/budget';
import { BudgetStatus, ItemType } from '@prisma/client';
import { toPlain } from '@/lib/serialize';
import { getTenantContext } from '@/lib/auth';

export async function createBudget(data: BudgetFormData) {
  try {
    const tenant = await getTenantContext();
    const validated = budgetSchema.parse(data);

    // Validar se cliente e veículo pertencem à oficina
    const [client, vehicle] = await Promise.all([
      prisma.client.findFirst({
        where: { id: validated.clientId, workshopId: tenant.workshopId },
      }),
      prisma.vehicle.findFirst({
        where: { id: validated.vehicleId, workshopId: tenant.workshopId },
      }),
    ]);

    if (!client || !vehicle) {
      return { success: false, error: 'Cliente ou veículo inválido para esta oficina.' };
    }

    // Calcular os totais server-side para consistência absoluta
    const itemsCalculated = validated.items.map((item) => {
      const lineSubtotal = Math.max(0, item.quantity * item.unitPrice - (item.discount || 0));
      return {
        type: item.type as ItemType,
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        subtotal: lineSubtotal,
      };
    });

    const sumSubtotal = itemsCalculated.reduce((acc, item) => acc + item.subtotal, 0);
    const globalDiscount = validated.discount || 0;
    const finalTotal = Math.max(0, sumSubtotal - globalDiscount);

    const budget = await prisma.budget.create({
      data: {
        workshopId: tenant.workshopId,
        clientId: validated.clientId,
        vehicleId: validated.vehicleId,
        userId: tenant.id,
        date: new Date(validated.date),
        expirationDate: new Date(validated.expirationDate),
        status: validated.status as BudgetStatus,
        notes: validated.notes?.trim() || null,
        subtotal: sumSubtotal,
        discount: globalDiscount,
        totalAmount: finalTotal,
        items: {
          create: itemsCalculated,
        },
      },
    });

    safeRevalidatePath('/orcamentos');
    safeRevalidatePath(`/clientes/${validated.clientId}`);
    safeRevalidatePath(`/veiculos/${validated.vehicleId}`);
    safeRevalidatePath('/');
    return { success: true, budget: toPlain(budget) };
  } catch (err: unknown) {
    console.error('Erro ao criar orçamento:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao criar orçamento.',
    };
  }
}

export async function updateBudget(id: string, data: BudgetFormData) {
  try {
    const tenant = await getTenantContext();
    const validated = budgetSchema.parse(data);

    const existingBudget = await prisma.budget.findFirst({
      where: { id, workshopId: tenant.workshopId },
    });

    if (!existingBudget) {
      return { success: false, error: 'Orçamento não encontrado nesta oficina.' };
    }

    // Validar cliente e veículo
    const [client, vehicle] = await Promise.all([
      prisma.client.findFirst({
        where: { id: validated.clientId, workshopId: tenant.workshopId },
      }),
      prisma.vehicle.findFirst({
        where: { id: validated.vehicleId, workshopId: tenant.workshopId },
      }),
    ]);

    if (!client || !vehicle) {
      return { success: false, error: 'Cliente ou veículo inválido para esta oficina.' };
    }

    const itemsCalculated = validated.items.map((item) => {
      const lineSubtotal = Math.max(0, item.quantity * item.unitPrice - (item.discount || 0));
      return {
        type: item.type as ItemType,
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        subtotal: lineSubtotal,
      };
    });

    const sumSubtotal = itemsCalculated.reduce((acc, item) => acc + item.subtotal, 0);
    const globalDiscount = validated.discount || 0;
    const finalTotal = Math.max(0, sumSubtotal - globalDiscount);

    // Deletar itens antigos e recriar os novos em transação
    const updated = await prisma.$transaction(async (tx) => {
      await tx.budgetItem.deleteMany({
        where: { budgetId: id },
      });

      return tx.budget.update({
        where: { id },
        data: {
          clientId: validated.clientId,
          vehicleId: validated.vehicleId,
          date: new Date(validated.date),
          expirationDate: new Date(validated.expirationDate),
          status: validated.status as BudgetStatus,
          notes: validated.notes?.trim() || null,
          subtotal: sumSubtotal,
          discount: globalDiscount,
          totalAmount: finalTotal,
          items: {
            create: itemsCalculated,
          },
        },
      });
    });

    safeRevalidatePath('/orcamentos');
    safeRevalidatePath(`/orcamentos/${id}`);
    safeRevalidatePath(`/clientes/${validated.clientId}`);
    safeRevalidatePath(`/veiculos/${validated.vehicleId}`);
    safeRevalidatePath('/');
    return { success: true, budget: toPlain(updated) };
  } catch (err: unknown) {
    console.error('Erro ao atualizar orçamento:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao atualizar orçamento.',
    };
  }
}

export async function updateBudgetStatus(id: string, status: BudgetStatus) {
  try {
    const tenant = await getTenantContext();

    const existingBudget = await prisma.budget.findFirst({
      where: { id, workshopId: tenant.workshopId },
    });

    if (!existingBudget) {
      return { success: false, error: 'Orçamento não encontrado nesta oficina.' };
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: { status },
    });

    safeRevalidatePath('/orcamentos');
    safeRevalidatePath(`/orcamentos/${id}`);
    safeRevalidatePath(`/clientes/${updated.clientId}`);
    safeRevalidatePath(`/veiculos/${updated.vehicleId}`);
    safeRevalidatePath('/');
    return { success: true, budget: toPlain(updated) };
  } catch (err: unknown) {
    console.error('Erro ao alterar status do orçamento:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao alterar status.',
    };
  }
}

export async function deleteBudget(id: string) {
  try {
    const tenant = await getTenantContext();

    const budget = await prisma.budget.findFirst({
      where: { id, workshopId: tenant.workshopId },
    });

    if (!budget) {
      return { success: false, error: 'Orçamento não encontrado nesta oficina.' };
    }

    await prisma.budget.delete({
      where: { id },
    });

    safeRevalidatePath('/orcamentos');
    safeRevalidatePath(`/clientes/${budget.clientId}`);
    safeRevalidatePath(`/veiculos/${budget.vehicleId}`);
    safeRevalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    console.error('Erro ao excluir orçamento:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao excluir orçamento.',
    };
  }
}
