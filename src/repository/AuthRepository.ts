import Repository from "./Repository";

export class AuthRepository extends Repository {
  constructor() {
    super();
  }

  async getByEmail(email: string) {
    const userAuthData = await this.prisma.auth.findUnique({
      where: { email },
      include: {
        User: {
          include: {
            address: true,
          },
        },
      },
    });
    return userAuthData;
  }

  async updatePassword(email: string, password: string) {
    const userAuthData = await this.prisma.auth.update({
      where: { email },
      data: {
        password,
      },
    });
    return userAuthData;
  }
}
