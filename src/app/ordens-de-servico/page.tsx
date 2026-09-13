import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import WorkOrderListClient from '@/components/workorders/WorkOrderListClient';
import { toPlain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export default async function OrdensDeServicoPage() {
  const currentUser = await getCurrentUser();
  const workshopId = currentUser?.workshopId || '';

  const rawWorkOrders = await prisma.workOrder.findMany({
    where: { workshopId },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      client: {
        select: { id: true, name: true, phone: true },
      },
      vehicle: {
        select: { id: true, brand: true, model: true, plate: true, type: true },
      },
    },
  });

  const workOrders = toPlain(rawWorkOrders);

  return (
    <AppShell user={currentUser}>
      <WorkOrderListClient initialWorkOrders={workOrders} />
    </AppShell>
  );
}
