import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import ClientListClient from '@/components/clients/ClientListClient';

export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  const currentUser = await getCurrentUser();
  const workshopId = currentUser?.workshopId || '';

  const clients = await prisma.client.findMany({
    where: { workshopId },
    orderBy: { createdAt: 'desc' },
    include: {
      vehicles: {
        select: {
          id: true,
          type: true,
          brand: true,
          model: true,
          plate: true,
        },
      },
      _count: {
        select: {
          budgets: true,
        },
      },
    },
  });

  return (
    <AppShell user={currentUser}>
      <ClientListClient initialClients={clients} />
    </AppShell>
  );
}
