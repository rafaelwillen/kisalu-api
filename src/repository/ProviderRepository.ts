import {
  Activity,
  Bidding,
  Dispute,
  ExperienceInfo,
  Portfolio,
  Service,
  User,
} from "@prisma/client";
import UserRepository, { CreatableUser } from "./UserRepository";

export type Provider = Omit<User, "loginId"> & {
  biddings: Bidding[];
  experiences: ExperienceInfo[];
  portfolios: Portfolio[];
  activities: Activity[];
  createdServices: Service[];
  disputes: Dispute[];
};

export class ProviderRepository extends UserRepository {
  constructor() {
    super();
  }

  async getProviderById(id: string): Promise<Provider | null> {
    const provider = await this.prisma.user.findUnique({
      where: { id },
      include: {
        biddings: true,
        experienceInfo: true,
        portfolio: true,
        providerActivities: true,
        services: true,
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

  async createProvider(data: CreatableUser) {
    return await this.createUser(data, "Provider");
  }
}
