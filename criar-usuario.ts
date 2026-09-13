import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Apagando dados...');

  // Apaga usuários primeiro, pois eles dependem da oficina
  await prisma.user.deleteMany();

  // Depois apaga as oficinas
  await prisma.workshop.deleteMany();

  console.log('✅ Dados antigos apagados.');

  // Cria uma nova oficina
  const workshop = await prisma.workshop.create({
    data: {
      name: 'Oficina Matriz',
      phone: '(11) 99999-0000',
      address: 'São Paulo - SP',
    },
  });

  console.log('🏭 Oficina criada:', workshop.name);

  // Cria a senha
  const passwordHash = await bcrypt.hash('123456', 10);

  // Cria o usuário vinculado à oficina
  const user = await prisma.user.create({
    data: {
      name: 'Francis Toledo',
      email: 'francisntoledo@hotmail.com',
      passwordHash,
      role: 'ADMIN',
      status: 'ATIVO',
      workshopId: workshop.id,
    },
  });

  console.log('👤 Usuário criado:', user.email);
  console.log('🏭 Oficina do usuário:', workshop.name);
}

main()
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });