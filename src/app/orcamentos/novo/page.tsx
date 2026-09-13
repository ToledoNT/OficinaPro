import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import BudgetForm from '@/components/budgets/BudgetForm';

interface NovoOrcamentoProps {
  searchParams: Promise<{ clientId?: string; vehicleId?: string }>;
}

export default async function NovoOrcamentoPage({ searchParams }: NovoOrcamentoProps) {
  const { clientId, vehicleId } = await searchParams;
  const currentUser = await getCurrentUser();
  const workshopId = currentUser?.workshopId || '';

  const [clients, vehicles] = await Promise.all([
    prisma.client.findMany({
      where: { workshopId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        cpf: true,
      },
    }),
    prisma.vehicle.findMany({
      where: { workshopId },
      orderBy: { model: 'asc' },
      select: {
        id: true,
        brand: true,
        model: true,
        plate: true,
        type: true,
        clientId: true,
      },
    }),
  ]);

  return (
    <AppShell user={currentUser}>
      <BudgetForm
        clients={clients}
        vehicles={vehicles}
        preselectedClientId={clientId}
        preselectedVehicleId={vehicleId}
      />
    </AppShell>
  );
}
