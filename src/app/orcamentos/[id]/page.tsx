import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import BudgetDetailsClient from '@/components/budgets/BudgetDetailsClient';
import { toPlain } from '@/lib/serialize';

interface OrcamentoDetalhesProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function OrcamentoDetalhesPage({ params }: OrcamentoDetalhesProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const workshopId = currentUser?.workshopId || '';

  const rawBudget = await prisma.budget.findFirst({
    where: { id, workshopId },
    include: {
      client: true,
      vehicle: true,
      items: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!rawBudget) {
    notFound();
  }

  const budget = toPlain(rawBudget);

  return (
    <AppShell user={currentUser}>
      <BudgetDetailsClient budget={budget} workshopName={currentUser?.workshopName} />
    </AppShell>
  );
}
