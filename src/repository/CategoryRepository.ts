import { Category, Project, Service, User } from "@prisma/client";
import Repository from "./Repository";

type CreatableCategory = Omit<Category, "id" | "createdAt">;

export type CompleteCategoryType = Category & {
  services: Omit<
    Service,
    "featuresImagesURL" | "isHighlighted" | "categoryId"
  >[];
  projects: Omit<Project, "featuresImagesURL" | "categoryId">[];
  admin: Pick<
    User,
    "id" | "firstName" | "lastName" | "avatarImageURL" | "gender"
  > | null;
};

export type EditableCategory = Omit<
  Category,
  "id" | "createdAt" | "creatorAdminId"
>;

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
        orderBy: { name: "asc" },
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
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarImageURL: true,
              gender: true,
            },
          },
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
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarImageURL: true,
              gender: true,
            },
          },
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

  async update(id: string, data: EditableCategory): Promise<Category> {
    try {
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data,
      });
      return updatedCategory;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getByName(name: string): Promise<Category | null> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { name },
      });
      return category;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
