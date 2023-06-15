import Repository from "./Repository";

export class AuthRepository extends Repository {
  constructor() {
    super();
  }

  async getByEmail(email: string) {
    const userAuthData = await this.prisma.auth.findUnique({
      where: { email },
      include: {
        User: true,
      },
    });
    return userAuthData;
  }
}
