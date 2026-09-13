import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import WorkOrderForm from '@/components/workorders/WorkOrderForm';
import { toPlain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

interface NovaOSProps {
  searchParams: Promise<{
    budgetId?: string;
  }>;
}

export default async function NovaOrdemDeServicoPage({ searchParams }: NovaOSProps) {
  const currentUser = await getCurrentUser();
  const workshopId = currentUser?.workshopId || '';
  const { budgetId } = await searchParams;

  // Buscar clientes com veículos da oficina
  const rawClients = await prisma.client.findMany({
    where: { workshopId },
    orderBy: { name: 'asc' },
    include: {
      vehicles: {
        select: {
          id: true,
          type: true,
          brand: true,
          model: true,
          plate: true,
          mileage: true,
        },
      },
    },
  });

  const clients = toPlain(rawClients);

  // Pré-preenchimento a partir do orçamento aprovado
  let prefillBudgetId: string | undefined;
  let prefillClientId: string | undefined;
  let prefillVehicleId: string | undefined;
  let prefillProblem: string | undefined;
  let prefillServicesDone: string | undefined;
  let prefillPartsUsed: string | undefined;
  let prefillNotes: string | undefined;
  let prefillMileage: number | undefined;
  let prefillTotal: number | undefined;
  let prefillResponsible: string | undefined;

  if (budgetId) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, workshopId },
      include: {
        items: true,
        vehicle: true,
      },
    });

    if (budget && budget.status === 'APROVADO') {
      prefillBudgetId = budget.id;
      prefillClientId = budget.clientId;
      prefillVehicleId = budget.vehicleId;
      prefillMileage = budget.vehicle.mileage;
      prefillTotal = Number(budget.totalAmount);
      prefillNotes = budget.notes || undefined;

      // Consolidar serviços e peças dos itens do orçamento
      const serviceItems = budget.items
        .filter((i) => i.type === 'SERVICO')
        .map((i) => `• ${Number(i.quantity)}x ${i.description}`)
        .join('\n');

      const partItems = budget.items
        .filter((i) => i.type === 'PECA')
        .map((i) => `• ${Number(i.quantity)}x ${i.description}`)
        .join('\n');

      prefillProblem = budget.notes
        ? `Serviço aprovado no Orçamento #${String(budget.code).padStart(4, '0')}.\nObservações: ${budget.notes}`
        : `Serviço aprovado no Orçamento #${String(budget.code).padStart(4, '0')}.`;

      prefillServicesDone = serviceItems || undefined;
      prefillPartsUsed = partItems || undefined;
    }
  }

  return (
    <AppShell user={currentUser}>
      <WorkOrderForm
        clients={clients}
        prefillBudgetId={prefillBudgetId}
        prefillClientId={prefillClientId}
        prefillVehicleId={prefillVehicleId}
        prefillProblem={prefillProblem}
        prefillServicesDone={prefillServicesDone}
        prefillPartsUsed={prefillPartsUsed}
        prefillNotes={prefillNotes}
        prefillMileage={prefillMileage}
        prefillTotal={prefillTotal}
        prefillResponsible={prefillResponsible}
      />
    </AppShell>
  );
}
