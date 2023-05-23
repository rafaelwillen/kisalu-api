import { Administrator, Category, Project, Service } from "@prisma/client";
import AbstractDAO from "./AbstractDAO";

interface ICreatableCategory {
  name: string;
  description: string;
  cardImageUrl: string;
  bannerImageUrl: string;
  administratorId: string;
}

interface IEditableCategory
  extends Omit<ICreatableCategory, "administratorId"> {
  id: string;
}

export type CompleteCategoryType = Category & {
  services: Service[];
  projects: Project[];
  createdBy: Administrator;
};

export default class CategoryModel extends AbstractDAO {
  constructor() {
    super();
  }

  async create({
    administratorId,
    bannerImageUrl,
    cardImageUrl,
    description,
    name,
  }: ICreatableCategory): Promise<Category> {
    try {
      const newCategory = await this.prisma.category.create({
        data: {
          administratorId,
          bannerImageUrl,
          cardImageUrl,
          description,
          name,
        },
      });
      return newCategory;
    } catch (error) {
      console.error(error);
      throw new Error("Database error on create category");
    }
  }

  async getAll(): Promise<CompleteCategoryType[]> {
    try {
      const categories = await this.prisma.category.findMany({
        include: { projects: {}, services: {}, createdBy: {} },
      });
      return categories;
    } catch (error) {
      console.log(error);
      throw new Error("Database error on get all categories");
    }
  }

  async getSingle(id: string): Promise<CompleteCategoryType | null> {
    try {
      const category = await this.prisma.category.findUnique({
        where: {
          id,
        },
        include: { projects: {}, services: {}, createdBy: {} },
      });
      return category;
    } catch (error) {
      console.log(error);
      throw new Error("Database error on get single category");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.category.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Database error on delete category");
    }
  }

  async update({
    bannerImageUrl,
    cardImageUrl,
    description,
    name,
    id,
  }: IEditableCategory): Promise<Category> {
    try {
      const updatedCategory = await this.prisma.category.update({
        where: {
          id,
        },
        data: {
          bannerImageUrl,
          cardImageUrl,
          description,
          name,
        },
      });
      return updatedCategory;
    } catch (error) {
      console.log(error);
      throw new Error("Database error on update category");
    }
  }
}
