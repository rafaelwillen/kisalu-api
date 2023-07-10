import {
  Activity,
  Bidding,
  Dispute,
  ExperienceInfo,
  Gender,
  Portfolio,
  Project,
  Review,
  Service,
  User,
} from "@prisma/client";
import Repository from "./Repository";

type CreatableUser = {
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

export type Client = Omit<User, "loginId"> & {
  reviews: Review[];
  activities: Activity[];
  createdProjects: Project[];
  disputes: Dispute[];
};

export type Provider = Omit<User, "loginId"> & {
  biddings: Bidding[];
  experiences: ExperienceInfo[];
  portfolios: Portfolio[];
  activities: Activity[];
  createdServices: Service[];
  disputes: Dispute[];
};

export default class UserRepository extends Repository {
  constructor() {
    super();
  }

  async createClient(data: CreatableUser) {
    const newClient = await this.prisma.user.create({
      data: {
        ...data,
        auth: {
          create: {
            ...data.auth,
            isActive: true,
            role: "Client",
          },
        },
      },
    });
    return newClient;
  }

  async createProvier(data: CreatableUser) {
    const newProvider = await this.prisma.user.create({
      data: {
        ...data,
        auth: {
          create: {
            ...data.auth,
            isActive: true,
            role: "Provider",
          },
        },
      },
    });
    return newProvider;
  }

  async getByEmail(email: string): Promise<User | null> {
    const userAuth = await this.prisma.auth.findUnique({
      where: { email },
      include: {
        User: true,
      },
    });
    if (!userAuth) return null;
    if (userAuth.role === "Administrator") return null;
    return userAuth.User;
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

  async getClientById(id: string): Promise<Client | null> {
    const client = await this.prisma.user.findUnique({
      where: { id },
      include: {
        clientActivities: true,
        disputes: true,
        reviews: true,
        projects: {
          include: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
    if (!client) return null;
    return {
      ...client,
      activities: client.clientActivities,
      reviews: client.reviews,
      createdProjects: client.projects,
      disputes: client.disputes,
    };
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
