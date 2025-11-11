import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@miniferias.pe' },
    update: {},
    create: {
      email: 'admin@miniferias.pe',
      password: adminPassword,
      name: 'Admin Miniferias',
      phone: '999999999',
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Exhibitor user
  const exhibitorPassword = await bcrypt.hash('exhibitor123', 10);
  const exhibitor = await prisma.user.upsert({
    where: { email: 'expositor@miniferias.pe' },
    update: {},
    create: {
      email: 'expositor@miniferias.pe',
      password: exhibitorPassword,
      name: 'Expositor Demo',
      phone: '988888888',
      role: 'EXHIBITOR'
    }
  });
  console.log('✅ Exhibitor user created:', exhibitor.email);

  // Create Visitor user
  const visitorPassword = await bcrypt.hash('visitor123', 10);
  const visitor = await prisma.user.upsert({
    where: { email: 'visitante@miniferias.pe' },
    update: {},
    create: {
      email: 'visitante@miniferias.pe',
      password: visitorPassword,
      name: 'Visitante Demo',
      phone: '977777777',
      role: 'VISITOR'
    }
  });
  console.log('✅ Visitor user created:', visitor.email);

  console.log('\n📋 Test Users Created:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 ADMIN:');
  console.log('   Email: admin@miniferias.pe');
  console.log('   Password: admin123');
  console.log('');
  console.log('🏪 EXHIBITOR:');
  console.log('   Email: expositor@miniferias.pe');
  console.log('   Password: exhibitor123');
  console.log('');
  console.log('🛒 VISITOR:');
  console.log('   Email: visitante@miniferias.pe');
  console.log('   Password: visitor123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
