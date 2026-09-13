'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/prisma';
import { serviceHistorySchema, ServiceHistoryFormData } from '@/lib/validations/serviceHistory';
import { toPlain } from '@/lib/serialize';
import { getTenantContext } from '@/lib/auth';

export async function createServiceHistory(data: ServiceHistoryFormData) {
  try {
    const tenant = await getTenantContext();
    const validated = serviceHistorySchema.parse(data);

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: validated.vehicleId, workshopId: tenant.workshopId },
    });

    if (!vehicle) {
      return { success: false, error: 'Veículo não encontrado nesta oficina.' };
    }

    const serviceDate = new Date(validated.date);

    // Criar o registro de histórico
    const history = await prisma.serviceHistory.create({
      data: {
        workshopId: tenant.workshopId,
        userId: tenant.id,
        vehicleId: validated.vehicleId,
        date: serviceDate,
        mileage: validated.mileage,
        problemReported: validated.problemReported.trim(),
        diagnosis: validated.diagnosis.trim(),
        servicesDone: validated.servicesDone.trim(),
        partsUsed: validated.partsUsed?.trim() || null,
        notes: validated.notes?.trim() || null,
        totalAmount: validated.totalAmount,
        responsibleName: validated.responsibleName.trim(),
      },
    });

    // Se a quilometragem do serviço for maior que a do veículo, atualizar o odômetro do veículo
    if (validated.mileage > vehicle.mileage) {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { mileage: validated.mileage },
      });
    }

    safeRevalidatePath(`/veiculos/${validated.vehicleId}`);
    safeRevalidatePath(`/clientes/${vehicle.clientId}`);
    safeRevalidatePath('/veiculos');
    safeRevalidatePath('/');
    return { success: true, history: toPlain(history) };
  } catch (err: unknown) {
    console.error('Erro ao registrar histórico de serviço:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao salvar registro de serviço.',
    };
  }
}

export async function deleteServiceHistory(id: string) {
  try {
    const tenant = await getTenantContext();

    const history = await prisma.serviceHistory.findFirst({
      where: { id, workshopId: tenant.workshopId },
      include: { vehicle: true },
    });

    if (!history) {
      return { success: false, error: 'Registro de serviço não encontrado nesta oficina.' };
    }

    await prisma.serviceHistory.delete({
      where: { id },
    });

    safeRevalidatePath(`/veiculos/${history.vehicleId}`);
    safeRevalidatePath(`/clientes/${history.vehicle.clientId}`);
    safeRevalidatePath('/veiculos');
    safeRevalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    console.error('Erro ao excluir histórico de serviço:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao excluir serviço.',
    };
  }
}
