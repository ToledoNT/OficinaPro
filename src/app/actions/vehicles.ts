'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/prisma';
import { vehicleSchema, VehicleFormData } from '@/lib/validations/vehicle';
import { getTenantContext } from '@/lib/auth';

export async function createVehicle(data: VehicleFormData) {
  try {
    const tenant = await getTenantContext();
    const validated = vehicleSchema.parse(data);
    const rawPlate = validated.plate ? validated.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
    const normalizedPlate = rawPlate.trim() !== '' ? rawPlate.trim() : null;

    // Verificar se o cliente pertence à oficina
    const client = await prisma.client.findFirst({
      where: { id: validated.clientId, workshopId: tenant.workshopId },
    });

    if (!client) {
      return { success: false, error: 'Cliente não encontrado nesta oficina.' };
    }

    // Verificar se placa já existe nesta oficina (somente se informada)
    if (normalizedPlate) {
      const existing = await prisma.vehicle.findFirst({
        where: { workshopId: tenant.workshopId, plate: normalizedPlate },
      });

      if (existing) {
        return { success: false, error: 'Já existe um veículo cadastrado com esta placa nesta oficina.' };
      }
    }

    const yearVal =
      typeof validated.year === 'number' && !isNaN(validated.year)
        ? validated.year
        : null;

    const newVehicle = await prisma.vehicle.create({
      data: {
        workshopId: tenant.workshopId,
        type: validated.type,
        brand: validated.brand?.trim() || null,
        model: validated.model?.trim() || null,
        year: yearVal,
        plate: normalizedPlate,
        mileage: Number(validated.mileage || 0),
        color: validated.color?.trim() || null,
        chassis: validated.chassis?.trim() || null,
        notes: validated.notes?.trim() || null,
        clientId: validated.clientId,
      },
    });

    safeRevalidatePath('/veiculos');
    safeRevalidatePath(`/clientes/${validated.clientId}`);
    safeRevalidatePath('/');
    return { success: true, vehicle: newVehicle };
  } catch (err: unknown) {
    console.error('Erro ao criar veículo:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao cadastrar veículo.',
    };
  }
}

export async function updateVehicle(id: string, data: VehicleFormData) {
  try {
    const tenant = await getTenantContext();
    const validated = vehicleSchema.parse(data);
    const rawPlate = validated.plate ? validated.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
    const normalizedPlate = rawPlate.trim() !== '' ? rawPlate.trim() : null;

    const existingVehicle = await prisma.vehicle.findFirst({
      where: { id, workshopId: tenant.workshopId },
    });

    if (!existingVehicle) {
      return { success: false, error: 'Veículo não encontrado nesta oficina.' };
    }

    // Verificar se outro veículo tem esta placa nesta oficina
    if (normalizedPlate) {
      const existing = await prisma.vehicle.findFirst({
        where: {
          workshopId: tenant.workshopId,
          plate: normalizedPlate,
          NOT: { id },
        },
      });

      if (existing) {
        return { success: false, error: 'Esta placa já pertence a outro veículo cadastrado nesta oficina.' };
      }
    }

    const yearVal =
      typeof validated.year === 'number' && !isNaN(validated.year)
        ? validated.year
        : null;

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        type: validated.type,
        brand: validated.brand?.trim() || null,
        model: validated.model?.trim() || null,
        year: yearVal,
        plate: normalizedPlate,
        mileage: Number(validated.mileage || 0),
        color: validated.color?.trim() || null,
        chassis: validated.chassis?.trim() || null,
        notes: validated.notes?.trim() || null,
        clientId: validated.clientId,
      },
    });

    safeRevalidatePath('/veiculos');
    safeRevalidatePath(`/veiculos/${id}`);
    safeRevalidatePath(`/clientes/${validated.clientId}`);
    safeRevalidatePath('/');
    return { success: true, vehicle: updated };
  } catch (err: unknown) {
    console.error('Erro ao atualizar veículo:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao atualizar veículo.',
    };
  }
}

export async function deleteVehicle(id: string) {
  try {
    const tenant = await getTenantContext();

    const vehicle = await prisma.vehicle.findFirst({
      where: { id, workshopId: tenant.workshopId },
      include: {
        _count: {
          select: { history: true, budgets: true, workOrders: true },
        },
      },
    });

    if (!vehicle) {
      return { success: false, error: 'Veículo não encontrado nesta oficina.' };
    }

    if (vehicle._count.history > 0) {
      return {
        success: false,
        error: `Não é possível excluir este veículo pois existem ${vehicle._count.history} registros de serviços executados vinculados a ele.`,
      };
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    safeRevalidatePath('/veiculos');
    safeRevalidatePath(`/clientes/${vehicle.clientId}`);
    safeRevalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    console.error('Erro ao excluir veículo:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao excluir veículo.',
    };
  }
}
