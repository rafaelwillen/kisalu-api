import { ExperienceInfo } from "@prisma/client";
import Repository from "./Repository";

type EditableExperienceInfo = Omit<ExperienceInfo, "providerUserId" | "type">;
type CreatableExperienceInfo = Omit<ExperienceInfo, "id" | "providerUserId">;

export class ExperienceInfoRepository extends Repository {
  constructor() {
    super();
  }

  async create(data: CreatableExperienceInfo, providerUserId: string) {
    const experienceInfo = await this.prisma.experienceInfo.create({
      data: {
        ...data,
        provider: { connect: { id: providerUserId } },
      },
    });
    return experienceInfo;
  }

  async getAllFromProvider(providerUserId: string) {
    const experienceInfos = await this.prisma.experienceInfo.findMany({
      where: { providerUserId },
    });
    return experienceInfos;
  }

  async delete(id: string) {
    await this.prisma.experienceInfo.delete({ where: { id } });
  }

  async update({ id, ...newData }: EditableExperienceInfo) {
    const experienceInfo = await this.prisma.experienceInfo.update({
      where: { id },
      data: newData,
    });
    return experienceInfo;
  }

  async getById(id: string) {
    const experienceInfo = await this.prisma.experienceInfo.findUnique({
      where: { id },
    });
    return experienceInfo;
  }
}
