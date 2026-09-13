import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import ServiceHistoryForm from '@/components/vehicles/ServiceHistoryForm';

interface NovoServicoProps {
  params: Promise<{ id: string }>;
}

export default async function NovoServicoPage({ params }: NovoServicoProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    notFound();
  }

  return (
    <AppShell user={currentUser}>
      <ServiceHistoryForm vehicle={vehicle} currentUser={currentUser} />
    </AppShell>
  );
}
