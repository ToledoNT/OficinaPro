import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import ClientForm from '@/components/clients/ClientForm';

export default async function NovoClientePage() {
  const currentUser = await getCurrentUser();

  return (
    <AppShell user={currentUser}>
      <ClientForm />
    </AppShell>
  );
}
