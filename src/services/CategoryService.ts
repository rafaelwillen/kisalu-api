import { HTTP_STATUS_CODE } from "@/constants";
import CategoryParser from "@/parsers/CategoryParser";
import AdministratorRepository from "@/repository/AdministratorRepository";
import CategoryRepository from "@/repository/CategoryRepository";
import { slugifyName } from "@/utils";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import { handleServiceError } from ".";

export default class CategoryService {
  private categoryRepository = new CategoryRepository();
  private readonly parser = new CategoryParser();

  async createCategory(request: FastifyRequest, reply: FastifyReply) {
    const administratorRepository = new AdministratorRepository();
    try {
      const { email } = request.user;
      const admin = await administratorRepository.getByEmail(email);
      if (!admin) throw new Error("Administrator not found");
      const parsedCategoryBody = this.parser.parseBodyForCreation(request);
      const categoryExists = await this.categoryRepository.getByName(
        parsedCategoryBody.name
      );
      if (categoryExists)
        throw new HTTPError(
          HTTP_STATUS_CODE.CONFLICT,
          "Category already exists"
        );
      const createdCategory = await this.categoryRepository.create({
        ...parsedCategoryBody,
        creatorAdminId: admin.id,
        slug: slugifyName(parsedCategoryBody.name),
      });
      return reply
        .code(HTTP_STATUS_CODE.CREATED)
        .send(omit(createdCategory, "creatorAdminId"));
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getAllCategories(request: FastifyRequest, reply: FastifyReply) {
    try {
      const categories = await this.categoryRepository.getAll();
      // TODO: Find a way to get the average rating of each category
      const parsedCategories = categories.map(
        ({ services, projects, ...restOfCategory }) => ({
          ...omit(
            restOfCategory,
            "admin",
            "creatorAdminId",
            "bannerImageURL",
            "description"
          ),
          totalServices: services.length,
          totalProjects: projects.length,
          availableServices: services.filter(
            (service) => service.state === "Available"
          ).length,
          availableProjects: projects.filter(
            (project) => project.state === "Available"
          ).length,
        })
      );
      return reply.send(parsedCategories);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getAllCategoriesAdminOnly(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const categories = await this.categoryRepository.getAll();
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
      handleServiceError(error, reply);
    }
  }

  async getCategoryByID(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.parser.parseIdFromParams(request);
      const category = await this.categoryRepository.getSingle(id);
      if (!category)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Category not found");
      return reply.send(category);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getCategoryBySlug(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = this.parser.parseSlugFromParams(request);
      const category = await this.categoryRepository.getBySlug(slug);
      if (!category)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Category not found");
      return reply.send(omit(category, "creatorAdminId"));
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async deleteCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.parser.parseIdFromParams(request);
      await this.categoryRepository.delete(id);
      return reply.send();
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async updateCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.parser.parseIdFromParams(request);
      const parsedCategoryBody = this.parser.parseBodyForCreation(request);
      const categoryExists = await this.categoryRepository.getByName(
        parsedCategoryBody.name
      );
      if (categoryExists)
        throw new HTTPError(
          HTTP_STATUS_CODE.CONFLICT,
          "Category already exists"
        );
      const updatedCategory = await this.categoryRepository.update(id, {
        ...parsedCategoryBody,
        slug: slugifyName(parsedCategoryBody.name),
      });
      return reply.send(updatedCategory);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getPopularCategories(request: FastifyRequest, reply: FastifyReply) {
    try {
      const categories = await this.categoryRepository.getPopular();
      const categoriesResponse = categories.map(({ _count, ...rest }) => ({
        ...rest,
        totalServices: _count.services,
        totalProjects: _count.projects,
      }));
      return reply.send(categoriesResponse);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async queryCategoriesByName(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name } = this.parser.parseSearchQuery(request);
      const categories = await this.categoryRepository.queryByName(name);
      const categoriesResponse = categories.map(({ name, slug, id }) => ({
        id,
        name,
        slug,
      }));
      return reply.send(categoriesResponse);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getProjectsByCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.parser.parseIdFromParams(request);
      const category = await this.categoryRepository.getSingle(id);
      if (!category)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Category not found");
      const { projects } = category;
      return reply.send(
        projects
          .map((project) => omit(project, "categoryId", "userId"))
          .filter((project) => project.state !== "Draft")
      );
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getServicesByCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.parser.parseIdFromParams(request);
      const category = await this.categoryRepository.getSingle(id);
      if (!category)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Category not found");
      const { services } = category;
      return reply.send(
        services
          .map((service) => omit(service, "categoryId", "userId"))
          .filter((service) => service.state !== "Draft")
      );
    } catch (error) {
      handleServiceError(error, reply);
    }
  }
}

