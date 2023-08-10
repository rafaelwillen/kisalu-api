import { Activity, Dispute, Project, Review, User } from "@prisma/client";
import UserRepository, { CreatableUser } from "./UserRepository";

export type Client = Omit<User, "loginId"> & {
  reviews: Review[];
  activities: Activity[];
  createdProjects: Project[];
  disputes: Dispute[];
};

export class ClientRepository extends UserRepository {
  constructor() {
    super();
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

  async createClient(data: CreatableUser) {
    return await this.createUser(data, "Client");
  }
}
