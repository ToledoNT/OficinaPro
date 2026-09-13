import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import ClientForm from '@/components/clients/ClientForm';

interface EditarClienteProps {
  params: Promise<{ id: string }>;
}

export default async function EditarClientePage({ params }: EditarClienteProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const workshopId = currentUser?.workshopId || '';

  const client = await prisma.client.findFirst({
    where: { id, workshopId },
  });

  if (!client) {
    notFound();
  }

  return (
    <AppShell user={currentUser}>
      <ClientForm initialData={client} />
    </AppShell>
  );
}
