const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
async function main() {
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  console.log("Admins:", admins.map(a => a.email));

  if (admins.length > 0) {
    const defaultPassword = "Admin123456!";
    const hash = bcrypt.hashSync(defaultPassword, 12);
    await prisma.user.update({
      where: { id: admins[0].id },
      data: { passwordHash: hash }
    });
    console.log(`Successfully reset password for ${admins[0].email} to: ${defaultPassword}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
