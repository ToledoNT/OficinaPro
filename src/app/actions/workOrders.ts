'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/prisma';
import { workOrderSchema, WorkOrderFormData } from '@/lib/validations/workOrder';
import { WorkOrderStatus } from '@prisma/client';
import { toPlain } from '@/lib/serialize';
import { getTenantContext } from '@/lib/auth';

/**
 * Gera uma Ordem de Serviço diretamente a partir de um Orçamento Aprovado
 */
export async function generateWorkOrderFromBudget(budgetId: string) {
  try {
    const tenant = await getTenantContext();

    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, workshopId: tenant.workshopId },
      include: {
        items: true,
        vehicle: true,
        client: true,
        workOrder: true,
      },
    });

    if (!budget) {
      return { success: false, error: 'Orçamento não encontrado nesta oficina.' };
    }

    if (budget.status !== 'APROVADO') {
      return {
        success: false,
        error: 'Apenas orçamentos com status APROVADO podem gerar uma Ordem de Serviço.',
      };
    }

    // Se já existe O.S. vinculada, retornar os dados da O.S. existente
    if (budget.workOrderId && budget.workOrder) {
      return {
        success: true,
        workOrder: toPlain(budget.workOrder),
        alreadyExisted: true,
      };
    }

    // Extrair e consolidar serviços e peças do orçamento
    const serviceItems = budget.items.filter((i) => i.type === 'SERVICO');
    const partItems = budget.items.filter((i) => i.type === 'PECA');

    const servicesText =
      serviceItems.length > 0
        ? serviceItems
            .map((i) => `• ${Number(i.quantity)}x ${i.description}`)
            .join('\n')
        : null;

    const partsText =
      partItems.length > 0
        ? partItems
            .map((i) => `• ${Number(i.quantity)}x ${i.description}`)
            .join('\n')
        : null;

    const problemDescription = budget.notes?.trim()
      ? `Serviço aprovado no Orçamento #${String(budget.code).padStart(4, '0')}.\nObservações: ${budget.notes.trim()}`
      : `Serviço aprovado no Orçamento #${String(budget.code).padStart(4, '0')}.`;

    // Criar O.S. e vincular ao Orçamento em transação
    const workOrder = await prisma.$transaction(async (tx) => {
      const wo = await tx.workOrder.create({
        data: {
          workshopId: tenant.workshopId,
          clientId: budget.clientId,
          vehicleId: budget.vehicleId,
          userId: tenant.id,
          status: 'AGUARDANDO',
          problemReported: problemDescription,
          diagnosis: 'Aprovado pelo cliente conforme orçamento comercial.',
          servicesDone: servicesText,
          partsUsed: partsText,
          notes: budget.notes?.trim() || null,
          mileageIn: budget.vehicle.mileage || 0,
          totalAmount: budget.totalAmount,
        },
      });

      await tx.budget.update({
        where: { id: budget.id },
        data: { workOrderId: wo.id },
      });

      return wo;
    });

    safeRevalidatePath('/ordens-de-servico');
    safeRevalidatePath(`/ordens-de-servico/${workOrder.id}`);
    safeRevalidatePath('/orcamentos');
    safeRevalidatePath(`/orcamentos/${budget.id}`);
    safeRevalidatePath(`/veiculos/${budget.vehicleId}`);
    safeRevalidatePath(`/clientes/${budget.clientId}`);
    safeRevalidatePath('/');

    return { success: true, workOrder: toPlain(workOrder) };
  } catch (err: unknown) {
    console.error('Erro ao gerar O.S. a partir do orçamento:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao gerar Ordem de Serviço.',
    };
  }
}

export async function createWorkOrder(data: WorkOrderFormData) {
  try {
    const tenant = await getTenantContext();
    const validated = workOrderSchema.parse(data);

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: validated.vehicleId, workshopId: tenant.workshopId },
    });

    if (!vehicle) {
      return { success: false, error: 'Veículo não encontrado nesta oficina.' };
    }

    const client = await prisma.client.findFirst({
      where: { id: validated.clientId, workshopId: tenant.workshopId },
    });

    if (!client) {
      return { success: false, error: 'Cliente não encontrado nesta oficina.' };
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        workshopId: tenant.workshopId,
        clientId: validated.clientId,
        vehicleId: validated.vehicleId,
        userId: tenant.id,
        problemReported: validated.problemReported.trim(),
        diagnosis: validated.diagnosis?.trim() || null,
        servicesDone: validated.servicesDone?.trim() || null,
        partsUsed: validated.partsUsed?.trim() || null,
        notes: validated.notes?.trim() || null,
        mileageIn: validated.mileageIn,
        mileageOut: validated.mileageOut ?? null,
        responsibleName: validated.responsibleName?.trim() || null,
        totalAmount: validated.totalAmount,
        estimatedAt: validated.estimatedAt ? new Date(validated.estimatedAt) : null,
        status: 'AGUARDANDO',
      },
    });

    // Se veio de um orçamento, vincular
    if (validated.budgetId) {
      await prisma.budget.updateMany({
        where: { id: validated.budgetId, workshopId: tenant.workshopId },
        data: { workOrderId: workOrder.id },
      });
    }

    safeRevalidatePath('/ordens-de-servico');
    safeRevalidatePath(`/veiculos/${validated.vehicleId}`);
    safeRevalidatePath(`/clientes/${validated.clientId}`);
    safeRevalidatePath('/orcamentos');
    safeRevalidatePath('/');

    return { success: true, workOrder: toPlain(workOrder) };
  } catch (err: unknown) {
    console.error('Erro ao criar O.S.:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao criar Ordem de Serviço.',
    };
  }
}

export async function updateWorkOrderStatus(id: string, status: WorkOrderStatus) {
  try {
    const tenant = await getTenantContext();

    const existing = await prisma.workOrder.findFirst({
      where: { id, workshopId: tenant.workshopId },
    });

    if (!existing) {
      return { success: false, error: 'Ordem de Serviço não encontrada nesta oficina.' };
    }

    const extraData: Record<string, Date | null> = {};

    if (status === 'EM_EXECUCAO') {
      extraData.startedAt = new Date();
    } else if (status === 'CONCLUIDO') {
      extraData.completedAt = new Date();
    }

    const updated = await prisma.workOrder.update({
      where: { id },
      data: { status, ...extraData },
    });

    safeRevalidatePath('/ordens-de-servico');
    safeRevalidatePath(`/ordens-de-servico/${id}`);
    safeRevalidatePath('/');

    return { success: true, workOrder: toPlain(updated) };
  } catch (err: unknown) {
    console.error('Erro ao alterar status da O.S.:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao alterar status.',
    };
  }
}

export async function updateWorkOrder(id: string, data: WorkOrderFormData) {
  try {
    const tenant = await getTenantContext();
    const validated = workOrderSchema.parse(data);

    const existing = await prisma.workOrder.findFirst({
      where: { id, workshopId: tenant.workshopId },
    });

    if (!existing) {
      return { success: false, error: 'Ordem de Serviço não encontrada nesta oficina.' };
    }

    const updated = await prisma.workOrder.update({
      where: { id },
      data: {
        problemReported: validated.problemReported.trim(),
        diagnosis: validated.diagnosis?.trim() || null,
        servicesDone: validated.servicesDone?.trim() || null,
        partsUsed: validated.partsUsed?.trim() || null,
        notes: validated.notes?.trim() || null,
        mileageIn: validated.mileageIn,
        mileageOut: validated.mileageOut ?? null,
        responsibleName: validated.responsibleName?.trim() || null,
        totalAmount: validated.totalAmount,
        estimatedAt: validated.estimatedAt ? new Date(validated.estimatedAt) : null,
      },
    });

    // Atualizar odômetro do veículo se saída for maior
    if (validated.mileageOut && validated.mileageOut > 0) {
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: updated.vehicleId, workshopId: tenant.workshopId },
      });
      if (vehicle && validated.mileageOut > vehicle.mileage) {
        await prisma.vehicle.update({
          where: { id: updated.vehicleId },
          data: { mileage: validated.mileageOut },
        });
      }
    }

    safeRevalidatePath('/ordens-de-servico');
    safeRevalidatePath(`/ordens-de-servico/${id}`);
    safeRevalidatePath(`/veiculos/${updated.vehicleId}`);
    safeRevalidatePath(`/clientes/${updated.clientId}`);
    safeRevalidatePath('/');

    return { success: true, workOrder: toPlain(updated) };
  } catch (err: unknown) {
    console.error('Erro ao atualizar O.S.:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao atualizar Ordem de Serviço.',
    };
  }
}

export async function concludeWorkOrder(
  id: string,
  data: {
    servicesDone: string;
    partsUsed?: string;
    mileageOut: number;
    responsibleName: string;
    totalAmount: number;
    notes?: string;
    generateHistory: boolean;
  }
) {
  try {
    const tenant = await getTenantContext();

    const workOrder = await prisma.workOrder.findFirst({
      where: { id, workshopId: tenant.workshopId },
      include: { vehicle: true },
    });

    if (!workOrder) {
      return { success: false, error: 'Ordem de Serviço não encontrada nesta oficina.' };
    }

    const now = new Date();

    const updated = await prisma.workOrder.update({
      where: { id },
      data: {
        status: 'CONCLUIDO',
        completedAt: now,
        servicesDone: data.servicesDone.trim(),
        partsUsed: data.partsUsed?.trim() || null,
        mileageOut: data.mileageOut,
        responsibleName: data.responsibleName.trim(),
        totalAmount: data.totalAmount,
        notes: data.notes?.trim() || null,
      },
    });

    // Gerar histórico de serviço automaticamente se solicitado
    if (data.generateHistory) {
      const history = await prisma.serviceHistory.create({
        data: {
          workshopId: tenant.workshopId,
          vehicleId: workOrder.vehicleId,
          date: now,
          mileage: data.mileageOut,
          problemReported: workOrder.problemReported,
          diagnosis:
            workOrder.diagnosis ||
            'Concluído conforme Ordem de Serviço #' + String(workOrder.code).padStart(4, '0'),
          servicesDone: data.servicesDone.trim(),
          partsUsed: data.partsUsed?.trim() || null,
          notes: data.notes?.trim() || null,
          totalAmount: data.totalAmount,
          responsibleName: data.responsibleName.trim(),
          userId: tenant.id,
        },
      });

      // Vincular o histórico gerado à O.S.
      await prisma.workOrder.update({
        where: { id },
        data: { serviceHistoryId: history.id },
      });
    }

    // Atualizar odômetro do veículo
    if (data.mileageOut > workOrder.vehicle.mileage) {
      await prisma.vehicle.update({
        where: { id: workOrder.vehicleId },
        data: { mileage: data.mileageOut },
      });
    }

    safeRevalidatePath('/ordens-de-servico');
    safeRevalidatePath(`/ordens-de-servico/${id}`);
    safeRevalidatePath(`/veiculos/${workOrder.vehicleId}`);
    safeRevalidatePath(`/clientes/${workOrder.clientId}`);
    safeRevalidatePath('/');

    return { success: true, workOrder: toPlain(updated) };
  } catch (err: unknown) {
    console.error('Erro ao concluir O.S.:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao concluir Ordem de Serviço.',
    };
  }
}

export async function deleteWorkOrder(id: string) {
  try {
    const tenant = await getTenantContext();

    const workOrder = await prisma.workOrder.findFirst({
      where: { id, workshopId: tenant.workshopId },
    });

    if (!workOrder) {
      return { success: false, error: 'Ordem de Serviço não encontrada nesta oficina.' };
    }

    if (workOrder.status === 'CONCLUIDO') {
      return {
        success: false,
        error: 'Não é possível excluir uma Ordem de Serviço já concluída.',
      };
    }

    // Desvincular do orçamento se houver
    await prisma.budget.updateMany({
      where: { workOrderId: id, workshopId: tenant.workshopId },
      data: { workOrderId: null },
    });

    await prisma.workOrder.delete({ where: { id } });

    safeRevalidatePath('/ordens-de-servico');
    safeRevalidatePath(`/veiculos/${workOrder.vehicleId}`);
    safeRevalidatePath(`/clientes/${workOrder.clientId}`);
    safeRevalidatePath('/orcamentos');
    safeRevalidatePath('/');

    return { success: true };
  } catch (err: unknown) {
    console.error('Erro ao excluir O.S.:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao excluir Ordem de Serviço.',
    };
  }
}
