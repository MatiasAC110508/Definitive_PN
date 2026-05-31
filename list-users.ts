import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
  });
  
  if (admins.length > 0) {
    console.log("Current admins:", admins.map(a => a.email));
    
    // reset the first admin's password to Admin123456!
    const hash = await bcrypt.hash("Admin123456!", 12);
    await prisma.user.update({
      where: { id: admins[0].id },
      data: { passwordHash: hash }
    });
    console.log(`Password for ${admins[0].email} reset to Admin123456!`);
  } else {
    console.log("No admins found, creating one...");
    const hash = await bcrypt.hash("Admin123456!", 12);
    await prisma.user.create({
      data: {
        email: "admin@perfectnails.com",
        name: "Admin Perfect Nails",
        role: "ADMIN",
        passwordHash: hash
      }
    });
    console.log("Created admin@perfectnails.com with password Admin123456!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
