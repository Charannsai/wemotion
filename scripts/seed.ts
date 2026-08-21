import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  await db.user.upsert({
    where: { id: 'dev-user-1' },
    update: {},
    create: {
      id: 'dev-user-1',
      name: 'Dev User',
      email: 'dev@wemotion.app',
      emailNormal: 'dev@wemotion.app',
      passwordHash: 'dummy'
    }
  });
  
  await db.workspace.upsert({
    where: { id: 'ws-default' },
    update: {},
    create: {
      id: 'ws-default',
      name: 'Default Workspace',
      slug: 'default-workspace'
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
