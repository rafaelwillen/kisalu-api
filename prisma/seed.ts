import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD environment variable is not set");
  }
  const admin = await prisma.auth.upsert({
    where: { email: "rafaelpadre@gmail.com" },
    create: {
      email: "rafaelpadre@gmail.com",
      password: process.env.ADMIN_PASSWORD,
      role: "Administrator",
      User: {
        create: {
          avatarImageURL:
            "https://firebasestorage.googleapis.com/v0/b/kisalu-server.appspot.com/o/images%2Favatar%2Fadmin.png?alt=media&token=b7e1dfba-4012-484e-a2e8-36487f987412",
          firstName: "Rafael",
          lastName: "Padre",
          gender: "Male",
        },
      },
    },
    update: {},
    select: {
      User: true,
    },
  });
  console.log("Admin user created with the id of -", admin.User?.id);
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
