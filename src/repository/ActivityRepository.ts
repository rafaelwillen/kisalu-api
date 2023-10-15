import { Activity, ActivityState, Address } from "@prisma/client";
import Repository from "./Repository";

type CreatableActivity = Omit<
  Activity,
  | "id"
  | "state"
  | "finishedDate"
  | "createdAt"
  | "dispute"
  | "project"
  | "client"
  | "provider"
  | "service"
  | "linkedProjectId"
  | "review"
> &
  Pick<Address, "county" | "addressLine" | "province">;

export default class ActivityRepository extends Repository {
  constructor() {
    super();
  }

  async create({ county, addressLine, province, ...data }: CreatableActivity) {
    const address = {
      county,
      addressLine,
      province,
    };
    const newActivity = await this.prisma.activity.create({
      data: {
        ...data,
        address: { create: address },
        state: "OnHold",
      },
    });
    return newActivity;
  }

  async getAll() {
    const activities = await this.prisma.activity.findMany({
      include: { service: true, client: true, provider: true, review: true },
    });
    return activities;
  }

  async getById(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: { service: true, client: true, provider: true, review: true },
    });
    return activity;
  }

  async getByUserId(userId: string) {
    const activities = await this.prisma.activity.findMany({
      where: {
        OR: [{ clientUserId: userId }, { providerUserId: userId }],
      },
      include: { service: true, client: true, provider: true, review: true },
    });
    return activities;
  }

  async getByServiceId(serviceId: string) {
    const activities = await this.prisma.activity.findMany({
      where: {
        linkedServiceId: serviceId,
      },
      include: { service: true, client: true, provider: true, review: true },
    });
    return activities;
  }

  async delete(id: string) {
    const activity = await this.prisma.activity.delete({
      where: { id },
    });
    return activity;
  }

  async setState(id: string, state: ActivityState) {
    const activity = await this.prisma.activity.update({
      where: { id },
      data: { state },
    });
    return activity;
  }
}
