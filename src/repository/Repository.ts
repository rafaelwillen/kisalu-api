import { prisma } from "@/configs/prisma";
import { PrismaClient } from "@prisma/client";

export default abstract class Repository {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }
}
