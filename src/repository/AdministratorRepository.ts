import { Gender, User } from "@prisma/client";
import Repository from "./Repository";

interface ICreatableAdministrator {
  firstName: string;
  lastName: string;
  avatarImageURL: string;
  gender: Gender;
  auth: {
    email: string;
    password: string;
  };
}

export default class AdministratorRepository extends Repository {
  constructor() {
    super();
  }

  async create(administrator: ICreatableAdministrator): Promise<User> {
    try {
      const newAdministrator = await this.prisma.user.create({
        data: {
          ...administrator,
          auth: {
            create: {
              ...administrator.auth,
              role: "Administrator",
            },
          },
        },
      });
      return newAdministrator;
    } catch (error) {
      throw error;
    }
  }

  async getByID(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          auth: true,
        },
      });
      if (!user) return null;
      if (user?.auth.role !== "Administrator") return null;
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const userAuth = await this.prisma.auth.findUnique({
        where: {
          email,
        },
        include: {
          User: true,
        },
      });
      if (!userAuth) return null;
      if (userAuth?.role !== "Administrator") return null;
      return userAuth.User;
    } catch (error) {
      throw error;
    }
  }
}
