import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import VehicleDetailsClient from '@/components/vehicles/VehicleDetailsClient';
import { toPlain } from '@/lib/serialize';

interface VeiculoDetalhesProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function VeiculoDetalhesPage({ params }: VeiculoDetalhesProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const workshopId = currentUser?.workshopId || '';

  const rawVehicle = await prisma.vehicle.findFirst({
    where: { id, workshopId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          cpf: true,
          phone: true,
          email: true,
        },
      },
      history: {
        orderBy: { date: 'desc' },
      },
      budgets: {
        orderBy: { date: 'desc' },
        select: {
          id: true,
          code: true,
          date: true,
          expirationDate: true,
          status: true,
          totalAmount: true,
        },
      },
    },
  });

  if (!rawVehicle) {
    notFound();
  }

  const vehicle = toPlain(rawVehicle);

  return (
    <AppShell user={currentUser}>
      <VehicleDetailsClient vehicle={vehicle} />
    </AppShell>
  );
}
