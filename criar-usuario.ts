import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'francisntoledo@hotmail.com';
  const password = '123456';

  const passwordHash = await bcrypt.hash(password, 10);

  // Garantir existência de uma oficina
  let workshop = await prisma.workshop.findFirst();
  if (!workshop) {
    workshop = await prisma.workshop.create({
      data: {
        name: 'Oficina Matriz',
        phone: '(11) 99999-0000',
        address: 'São Paulo - SP',
      },
    });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      workshopId: workshop.id,
    },
    create: {
      name: 'Francis Toledo',
      email,
      passwordHash,
      role: 'ADMIN',
      status: 'ATIVO',
      workshopId: workshop.id,
    },
  });

  console.log('Usuário atualizado/criado:', user.email, 'na oficina:', workshop.name);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
