import { HTTP_STATUS_CODE } from "@/constants";
import { AdministratorRepository, CategoryRepository } from "@/repository";
import { slugifyName } from "@/utils";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import { z } from "zod";
import { handleServiceError } from ".";

export default class CategoryService {
  private categoryRepository: CategoryRepository | undefined;

  async createCategory(request: FastifyRequest, reply: FastifyReply) {
    this.categoryRepository = new CategoryRepository();
    const administratorRepository = new AdministratorRepository();
    try {
      const admin = await administratorRepository.getByEmail(
        "rafaelpadre@gmail.com"
      );
      administratorRepository.close();
      if (!admin) throw new Error("Administrator not found");
      const parsedCategoryBody = parseBodyForCreateCategory(request);
      const createdCategory = await this.categoryRepository.create({
        ...parsedCategoryBody,
        creatorAdminId: admin.id,
        slug: slugifyName(parsedCategoryBody.name),
      });
      this.categoryRepository.close();
      return reply
        .code(HTTP_STATUS_CODE.CREATED)
        .send(omit(createdCategory, "creatorAdminId"));
    } catch (error) {
      handleServiceError(
        error,
        [this.categoryRepository, administratorRepository],
        reply
      );
    }
  }

  async getAllCategories(request: FastifyRequest, reply: FastifyReply) {
    this.categoryRepository = new CategoryRepository();
    try {
      const categories = await this.categoryRepository.getAll();
      this.categoryRepository.close();
      const parsedCategories = categories.map(
        ({ services, projects, ...restOfCategory }) => ({
          totalServices: services.length,
          totalProjects: projects.length,
          availableServices: services.filter(
            (service) => service.state === "Available"
          ).length,
          availableProjects: projects.filter(
            (project) => project.state === "Available"
          ).length,
          ...omit(
            restOfCategory,
            "id",
            "admin",
            "creatorAdminId",
            "bannerImageURL"
          ),
        })
      );
      return reply.send(parsedCategories);
    } catch (error) {
      handleServiceError(error, [this.categoryRepository], reply);
    }
  }

  async getAllCategoriesAdminOnly(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    this.categoryRepository = new CategoryRepository();
    try {
      const categories = await this.categoryRepository.getAll();
      this.categoryRepository.close();
      const parsedCategories = categories.map(
        ({ services, projects, ...restOfCategory }) => ({
          totalServices: services.length,
          totalProjects: projects.length,
          availableServices: services.filter(
            (service) => service.state === "Available"
          ).length,
          availableProjects: projects.filter(
            (project) => project.state === "Available"
          ).length,
          createdBy: omit(restOfCategory.admin, "biography", "birthDate"),
          ...omit(restOfCategory, "admin", "creatorAdminId", "bannerImageURL"),
        })
      );
      return reply.send(parsedCategories);
    } catch (error) {
      handleServiceError(error, [this.categoryRepository], reply);
    }
  }

  async getCategoryByID(request: FastifyRequest, reply: FastifyReply) {
    throw new Error("Not implemented");
  }

  async getCategoryBySlug(request: FastifyRequest, reply: FastifyReply) {
    throw new Error("Not implemented");
  }

  async deleteCategory(request: FastifyRequest, reply: FastifyReply) {
    throw new Error("Not implemented");
  }

  async updateCategory(request: FastifyRequest, reply: FastifyReply) {
    throw new Error("Not implemented");
  }
}

function parseBodyForCreateCategory(request: FastifyRequest) {
  const schema = z.object({
    name: z.string().nonempty().min(3).max(255),
    mainImageURL: z.string().url(),
    bannerImageURL: z.string().url(),
    description: z.string().nonempty().min(3).max(255),
  });
  return schema.parse(request.body);
}
