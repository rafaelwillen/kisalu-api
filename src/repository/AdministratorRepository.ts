import { Auth, Category, Dispute, Gender, User } from "@prisma/client";
import UserRepository from "./UserRepository";

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

export type CompleteAdministratorType = Omit<
  User,
  "biography" | "birthDate"
> & {
  auth: Pick<Auth, "email" | "role">;
  disputes: Dispute[];
  createdCategories: Category[];
};

export type AdminUpdateType = {
  firstName?: string;
  lastName?: string;
  avatarImageURL?: string;
  gender?: Gender;
};

export default class AdministratorRepository extends UserRepository {
  constructor() {
    super();
  }

  async create(administrator: ICreatableAdministrator): Promise<User> {
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
  }

  async getByID(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        auth: true,
        disputes: true,
        createdCategories: true,
      },
    });
    if (!user) return null;
    if (user.auth.role !== "Administrator") return null;
    return user;
  }

  async getAll(): Promise<CompleteAdministratorType[]> {
    const administrators = await this.prisma.user.findMany({
      where: {
        auth: {
          role: "Administrator",
        },
      },
      include: {
        auth: true,
        disputes: true,
        createdCategories: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });
    return administrators;
  }

  async delete(email: string): Promise<void> {
    await this.prisma.auth.delete({
      where: { email },
    });
  }

  async update(id: string, data: AdminUpdateType): Promise<User> {
    const updatedAdministrator = await this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
    return updatedAdministrator;
  }
}
