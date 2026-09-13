import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import VehicleForm from '@/components/vehicles/VehicleForm';

interface EditarVeiculoProps {
  params: Promise<{ id: string }>;
}

export default async function EditarVeiculoPage({ params }: EditarVeiculoProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const workshopId = currentUser?.workshopId || '';

  const [vehicle, clients] = await Promise.all([
    prisma.vehicle.findFirst({
      where: { id, workshopId },
    }),
    prisma.client.findMany({
      where: { workshopId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        cpf: true,
      },
    }),
  ]);

  if (!vehicle) {
    notFound();
  }

  return (
    <AppShell user={currentUser}>
      <VehicleForm initialData={vehicle} clients={clients} />
    </AppShell>
  );
}
