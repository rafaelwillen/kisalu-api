import { Project } from "@prisma/client";
import Repository from "./Repository";

type CreatableProject = Omit<
  Project,
  "id" | "createdAt" | "state" | "publishedDate" | "viewsCount"
>;

export default class ProjectRepository extends Repository {
  constructor() {
    super();
  }

  async create(data: CreatableProject): Promise<Project> {
    const newProject = await this.prisma.project.create({ data });
    return newProject;
  }

  async toggleToAvailable(
    id: string,
    state: "Available" | "Draft"
  ): Promise<Project> {
    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: { state, publishedDate: state === "Available" ? new Date() : null },
    });
    return updatedProject;
  }

  async getById(projectId: string, ownerId: string): Promise<Project | null> {
    const project = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        projects: {
          where: { id: projectId },
        },
      },
    });
    if (!project) return null;
    return project.projects[0];
  }

  async getAllByOwnerId(ownerId: string) {
    const projects = await this.prisma.project.findMany({
      where: { userId: ownerId },
      include: {
        activities: true,
        biddings: true,
        category: {
          select: { name: true, slug: true },
        },
      },
    });
    return projects;
  }
}
