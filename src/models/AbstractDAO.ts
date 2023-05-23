import { PrismaClient } from "@prisma/client";

export default abstract class AbstractDAO {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  close() {
    this.prisma.$disconnect();
  }
}
