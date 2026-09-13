import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import VehicleListClient from '@/components/vehicles/VehicleListClient';

export const dynamic = 'force-dynamic';

export default async function VeiculosPage() {
  const currentUser = await getCurrentUser();
  const workshopId = currentUser?.workshopId || '';

  const vehicles = await prisma.vehicle.findMany({
    where: { workshopId },
    orderBy: { createdAt: 'desc' },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      _count: {
        select: {
          history: true,
          budgets: true,
        },
      },
    },
  });

  return (
    <AppShell user={currentUser}>
      <VehicleListClient initialVehicles={vehicles} />
    </AppShell>
  );
}
