import { Administrator } from "@prisma/client";
import Repository from "./Repository";

export default class AdministratorRepository extends Repository {
  constructor() {
    super();
  }

  async getByID(id: string): Promise<Administrator | null> {
    try {
      const administrator = await this.prisma.administrator.findUnique({
        where: {
          id,
        },
      });

      return administrator;
    } catch (error) {
      throw new Error("Database error on get single administrator");
    }
  }

  async getByEmail(email: string): Promise<Administrator | null> {
    try {
      const administrator = await this.prisma.administrator.findUnique({
        where: {
          email,
        },
      });

      return administrator;
    } catch (error) {
      throw new Error("Database error on get single administrator");
    }
  }

  async getByUsername(username: string): Promise<Administrator | null> {
    try {
      const administrator = await this.prisma.administrator.findUnique({
        where: {
          username,
        },
      });
      return administrator;
    } catch (error) {
      throw new Error("Database error on get single administrator");
    }
  }
}
