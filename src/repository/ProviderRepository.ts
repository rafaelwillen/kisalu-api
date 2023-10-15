import {
  Activity,
  Bidding,
  Dispute,
  ExperienceInfo,
  Portfolio,
  Review,
  Service,
  User,
} from "@prisma/client";
import UserRepository, { CreatableUser } from "./UserRepository";

export type Provider = Omit<User, "loginId"> & {
  biddings: Bidding[];
  experiences: ExperienceInfo[];
  portfolios: Portfolio[];
  activities: Activity[];
  reviews: Review[];
  createdServices: (Service & {
    category: {
      name: string;
    } | null;
  })[];
  disputes: Dispute[];
};

export class ProviderRepository extends UserRepository {
  constructor() {
    super();
  }

  async getProviderById(id: string) {
    const provider = await this.prisma.user.findUnique({
      where: { id },
      include: {
        biddings: true,
        experienceInfo: true,
        portfolio: true,
        providerActivities: true,
        address: true,
        auth: {
          select: {
            role: true,
            createdAt: true,
            phoneNumber: true,
            email: true,
          },
        },
        reviews: {
          include: {
            client: {
              select: {
                avatarImageURL: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        services: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        disputes: true,
      },
    });
    if (!provider) return null;
    return {
      ...provider,
      activities: provider.providerActivities,
      experiences: provider.experienceInfo,
      portfolios: provider.portfolio,
      createdServices: provider.services,
    };
  }

  async getAllProviders() {
    const providers = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            auth: {
              role: "Provider",
            },
          },
          {
            address: {
              isNot: null,
            },
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarImageURL: true,
        biography: true,
        birthDate: true,
        gender: true,
        experienceInfo: true,
        portfolio: true,
        reviews: true,
        providerActivities: true,
        services: true,
        disputes: true,
        address: true,
      },
    });
    return providers;
  }

  async createProvider(data: CreatableUser) {
    return await this.createUser(data, "Provider");
  }
}
