import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import BudgetListClient from '@/components/budgets/BudgetListClient';
import { toPlain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export default async function OrcamentosPage() {
  const currentUser = await getCurrentUser();
  const workshopId = currentUser?.workshopId || '';

  const rawBudgets = await prisma.budget.findMany({
    where: { workshopId },
    orderBy: { date: 'desc' },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          brand: true,
          model: true,
          plate: true,
          type: true,
        },
      },
    },
  });

  const budgets = toPlain(rawBudgets);

  return (
    <AppShell user={currentUser}>
      <BudgetListClient initialBudgets={budgets} />
    </AppShell>
  );
}
