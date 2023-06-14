import { Category, Project, Service, User } from "@prisma/client";
import Repository from "./Repository";

type CreatableCategory = Omit<Category, "id" | "createdAt">;

export type CompleteCategoryType = Category & {
  services: Service[];
  projects: Project[];
  admin: User | null;
};

export default class CategoryRepository extends Repository {
  constructor() {
    super();
  }

  async create(data: CreatableCategory): Promise<Category> {
    try {
      const newCategory = await this.prisma.category.create({
        data,
      });
      this.close();
      return newCategory;
    } catch (error) {
      this.close();
      throw error;
    }
  }

  async getAll(): Promise<CompleteCategoryType[]> {
    try {
      const categories = await this.prisma.category.findMany({
        include: {
          services: true,
          projects: true,
          admin: true,
        },
      });
      return categories;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getSingle(id: string): Promise<CompleteCategoryType | null> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          services: true,
          projects: true,
          admin: true,
        },
      });
      return category;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getBySlug(slug: string): Promise<CompleteCategoryType | null> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { slug },
        include: {
          services: true,
          projects: true,
          admin: true,
        },
      });
      return category;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // TODO: Implement the update method
}
