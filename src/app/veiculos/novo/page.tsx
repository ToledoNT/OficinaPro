import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import VehicleForm from '@/components/vehicles/VehicleForm';

interface NovoVeiculoProps {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function NovoVeiculoPage({ searchParams }: NovoVeiculoProps) {
  const { clientId } = await searchParams;
  const currentUser = await getCurrentUser();
  const workshopId = currentUser?.workshopId || '';

  const clients = await prisma.client.findMany({
    where: { workshopId },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      cpf: true,
    },
  });

  return (
    <AppShell user={currentUser}>
      <VehicleForm clients={clients} preselectedClientId={clientId} />
    </AppShell>
  );
}
