import { PrismaClient } from "@prisma/client";

export default abstract class Repository {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ["query", "info", "warn"],
    });
  }

  close() {
    this.prisma.$disconnect();
  }
}
