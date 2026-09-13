import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import WorkOrderDetailsClient from '@/components/workorders/WorkOrderDetailsClient';
import { toPlain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

interface OSDetalhesProps {
  params: Promise<{ id: string }>;
}

export default async function OrdemDeServicoDetalhesPage({ params }: OSDetalhesProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const workshopId = currentUser?.workshopId || '';

  const rawWorkOrder = await prisma.workOrder.findFirst({
    where: { id, workshopId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          cpf: true,
          phone: true,
          email: true,
          address: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          brand: true,
          model: true,
          plate: true,
          year: true,
          mileage: true,
          color: true,
          type: true,
        },
      },
      budget: {
        select: { id: true, code: true },
      },
    },
  });

  if (!rawWorkOrder) {
    notFound();
  }

  const workOrder = toPlain(rawWorkOrder);

  return (
    <AppShell user={currentUser}>
      <WorkOrderDetailsClient workOrder={workOrder} workshopName={currentUser?.workshopName} />
    </AppShell>
  );
}
