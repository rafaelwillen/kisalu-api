import { PrismaClient } from "@prisma/client";

export default abstract class Repository {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ["warn"],
    });
  }

  close() {
    this.prisma.$disconnect();
  }
}
