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
    const newCategory = await this.prisma.category.create({
      data,
    });
    return newCategory;
  }

  async getAll(): Promise<CompleteCategoryType[]> {
    const categories = await this.prisma.category.findMany({
      include: {
        services: true,
        projects: true,
        admin: true,
      },
      orderBy: { name: "asc" },
    });
    return categories;
  }

  async getSingle(id: string): Promise<CompleteCategoryType | null> {
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
  }

  async getBySlug(
    slug: string
  ): Promise<Omit<CompleteCategoryType, "admin"> | null> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        services: {
          include: {
            User: {
              select: {
                avatarImageURL: true,
                firstName: true,
                lastName: true,
                reviews: true,
              },
            },
          },
        },
        projects: {
          include: {
            User: {
              select: {
                avatarImageURL: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    return category;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async update(id: string, data: EditableCategory): Promise<Category> {
    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data,
    });
    return updatedCategory;
  }

  async getByName(name: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { name },
    });
    return category;
  }

  async getPopular() {
    const numberOfPopularCategories = 12;
    // TODO: When the app grows, implement a better way to get popular categories
    const popularCategories = await this.prisma.category.findMany({
      take: numberOfPopularCategories,
      orderBy: [
        {
          services: {
            _count: "desc",
          },
        },
        {
          projects: {
            _count: "desc",
          },
        },
        {
          name: "asc",
        },
      ],
      select: {
        _count: true,
        name: true,
        slug: true,
      },
    });
    return popularCategories;
  }

  async getAverageRating(id: string) {
    throw new Error("Method not implemented.");
  }

  queryByName(name: string) {
    const foundCategories = this.prisma.category.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
      orderBy: { name: "asc" },
    });
    return foundCategories;
  }
}
