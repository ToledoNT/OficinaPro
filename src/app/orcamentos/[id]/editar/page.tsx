import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import BudgetForm from '@/components/budgets/BudgetForm';
import { toPlain } from '@/lib/serialize';

interface EditarOrcamentoProps {
  params: Promise<{ id: string }>;
}

export default async function EditarOrcamentoPage({ params }: EditarOrcamentoProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const workshopId = currentUser?.workshopId || '';

  const [rawBudget, clients, vehicles] = await Promise.all([
    prisma.budget.findFirst({
      where: { id, workshopId },
      include: {
        items: true,
      },
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

  if (!rawBudget) {
    notFound();
  }

  const budget = toPlain(rawBudget);

  return (
    <AppShell user={currentUser}>
      <BudgetForm initialData={budget} clients={clients} vehicles={vehicles} />
    </AppShell>
  );
}
