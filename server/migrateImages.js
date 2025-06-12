const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateImages() {
  try {
    const posts = await prisma.post.findMany({ where: { image: { not: null } } });
    for (const post of posts) {
      await prisma.post.update({
        where: { id: post.id },
        data: { images: post.image ? [post.image] : null },
      });
      console.log(`Migrated post ${post.id}`);
    }
    console.log('Migration complete');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateImages();