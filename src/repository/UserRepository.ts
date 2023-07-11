import { Gender } from "@prisma/client";
import Repository from "./Repository";

export type CreatableUser = {
  firstName: string;
  lastName: string;
  avatarImageURL: string;
  biography?: string;
  birthDate: Date;
  gender: Gender;
  auth: {
    email: string;
    password: string;
    phoneNumber: string;
  };
};

export default class UserRepository extends Repository {
  constructor() {
    super();
  }

  protected async createUser(data: CreatableUser, role: "Client" | "Provider") {
    const newUser = await this.prisma.user.create({
      data: {
        ...data,
        auth: {
          create: {
            ...data.auth,
            isActive: false,
            role,
          },
        },
      },
    });
    return newUser;
  }

  async updateUserAvatarImageURL(url: string, id: string) {
    const updatedProvider = await this.prisma.user.update({
      where: { id },
      data: {
        avatarImageURL: url,
      },
    });
    return updatedProvider;
  }

  async getByEmail(email: string) {
    const userAuth = await this.prisma.auth.findUnique({
      where: { email },
      include: {
        User: {
          include: {
            address: true,
          },
        },
      },
    });
    if (!userAuth) return null;
    return userAuth.User;
  }

  async getByPhoneNumber(phoneNumber: string) {
    const userAuth = await this.prisma.auth.findUnique({
      where: { phoneNumber },
      include: {
        User: true,
      },
    });
    if (!userAuth) return null;
    if (userAuth.role === "Administrator") return null;
    return userAuth.User;
  }
}
