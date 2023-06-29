import { HTTP_STATUS_CODE } from "@/constants";
import { AdministratorRepository, CategoryRepository } from "@/repository";
import { slugifyName } from "@/utils";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import { z } from "zod";
import { handleServiceError, parseIdParams } from ".";

export default class CategoryService {
  private categoryRepository: CategoryRepository | undefined;

  async createCategory(request: FastifyRequest, reply: FastifyReply) {
    this.categoryRepository = new CategoryRepository();
    const administratorRepository = new AdministratorRepository();
    try {
      const { email } = request.user;
      const admin = await administratorRepository.getByEmail(email);
      administratorRepository.close();
      if (!admin) throw new Error("Administrator not found");
      const parsedCategoryBody = parseBodyForCreateCategory(request);
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
      // TODO: Find a way to get the average rating of each category
      this.categoryRepository.close();
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
    this.categoryRepository = new CategoryRepository();
    try {
      const { id } = parseIdParams(request);
      const category = await this.categoryRepository.getSingle(id);
      this.categoryRepository.close();
      if (!category)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Category not found");
      return reply.send(category);
    } catch (error) {
      handleServiceError(error, [this.categoryRepository], reply);
    }
  }

  async getCategoryBySlug(request: FastifyRequest, reply: FastifyReply) {
    this.categoryRepository = new CategoryRepository();
    try {
      const { slug } = parseCategoryBySlugParams(request);
      const category = await this.categoryRepository.getBySlug(slug);
      this.categoryRepository.close();
      if (!category)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Category not found");
      return reply.send(category);
    } catch (error) {
      handleServiceError(error, [this.categoryRepository], reply);
    }
  }

  async deleteCategory(request: FastifyRequest, reply: FastifyReply) {
    this.categoryRepository = new CategoryRepository();
    try {
      const { id } = parseIdParams(request);
      await this.categoryRepository.delete(id);
      this.categoryRepository.close();
      return reply.send();
    } catch (error) {
      handleServiceError(error, [this.categoryRepository], reply);
    }
  }

  async updateCategory(request: FastifyRequest, reply: FastifyReply) {
    this.categoryRepository = new CategoryRepository();
    try {
      const { id } = parseIdParams(request);
      const parsedCategoryBody = parseBodyForCreateCategory(request);
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
      this.categoryRepository.close();
      return reply.send(updatedCategory);
    } catch (error) {
      handleServiceError(error, [this.categoryRepository], reply);
    }
  }

  async getPopularCategories(request: FastifyRequest, reply: FastifyReply) {
    this.categoryRepository = new CategoryRepository();
    try {
      const categories = await this.categoryRepository.getPopular();
      this.categoryRepository.close();
      const categoriesResponse = categories.map(({ _count, ...rest }) => ({
        ...rest,
        totalServices: _count.services,
        totalProjects: _count.projects,
      }));
      return reply.send(categoriesResponse);
    } catch (error) {
      handleServiceError(error, [this.categoryRepository], reply);
    }
  }

  async queryCategoriesByName(request: FastifyRequest, reply: FastifyReply) {
    this.categoryRepository = new CategoryRepository();
    try {
      const { name } = parseNameQuery(request);
      const categories = await this.categoryRepository.queryByName(name);
      this.categoryRepository.close();
      const categoriesResponse = categories.map(({ name, slug, id }) => ({
        id,
        name,
        slug,
      }));
      return reply.send(categoriesResponse);
    } catch (error) {
      handleServiceError(error, [this.categoryRepository], reply);
    }
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

function parseCategoryBySlugParams(request: FastifyRequest) {
  const schema = z.object({
    slug: z.string().nonempty().min(3).max(255),
  });
  return schema.parse(request.params);
}

function parseNameQuery(request: FastifyRequest) {
  const schema = z.object({
    name: z.string().nonempty().min(3).max(255),
  });
  return schema.parse(request.query);
}