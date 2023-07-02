import { Service } from "@prisma/client";
import Repository from "./Repository";

type CreatableService = Omit<
  Service,
  "id" | "createdAt" | "state" | "publishedDate" | "viewsCount"
>;

export default class ServiceRepository extends Repository {
  constructor() {
    super();
  }

  async create(data: CreatableService): Promise<Service> {
    const newService = await this.prisma.service.create({ data });
    return newService;
  }

  async getByIdFromOwner(projectId: string, ownerId: string) {
    const service = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        services: {
          where: { id: projectId },
        },
      },
    });
    if (!service) return null;
    return service.services[0];
  }

  async getById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });
    return service;
  }

  async getAllByOwnerId(ownerId: string) {
    const services = await this.prisma.service.findMany({
      where: { userId: ownerId },
      include: {
        activities: true,
        category: {
          select: { name: true, slug: true },
        },
      },
    });
    return services;
  }
}
