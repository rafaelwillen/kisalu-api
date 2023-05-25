import { CategoryRepository } from "@/repository";
import { noSymbolRegex } from "@/utils/regex";
import { FastifyReply, FastifyRequest } from "fastify";
import underscore from "underscore";
import { z } from "zod";

export default class CategoryService {
  private categoryModel: CategoryRepository | undefined;

  async createCategory(request: FastifyRequest, reply: FastifyReply) {
    this.categoryModel = new CategoryRepository();
    try {
      const categoryBody = parseBodyForCreateCategory(request);
      const category = await this.categoryModel.create({
        ...categoryBody,
        // TODO: Add the actual admin id
        administratorId: "66bd1956-b311-4415-8ce3-b1967b1c40fb",
      });
      this.categoryModel.close();
      reply.code(201).send(underscore.omit(category, "administratorId"));
    } catch (error) {
      this.categoryModel.close();
      if (error instanceof z.ZodError)
        reply.code(400).send({ message: "Bad request", errors: error.errors });
      console.error(error, "Category Service Error");
      reply.code(500).send({ message: "Internal server error" });
    }
  }

  async getAllCategories(request: FastifyRequest, reply: FastifyReply) {
    this.categoryModel = new CategoryRepository();
    try {
      const categories = await this.categoryModel.getAll();
      reply.send(
        categories.map((category) => ({
          id: category.id,
          name: category.name,
          cardImageUrl: category.cardImageUrl,
          numberOfProjects: category.projects.length,
          numberOfServices: category.services.length,
        }))
      );
      this.categoryModel.close();
    } catch (error) {
      this.categoryModel.close();
      console.error(error, "Category Service Error");
      reply.code(500).send({ message: "Internal server error" });
    }
  }

  async getCategoryById(request: FastifyRequest, reply: FastifyReply) {
    this.categoryModel = new CategoryRepository();
    try {
      const { id: categoryId } = z
        .object({
          id: z.string().nonempty().uuid(),
        })
        .parse(request.params);
      const category = await this.categoryModel.getSingle(categoryId);
      if (!category) {
        reply.code(404).send({ message: "Category not found" });
        return;
      }
      reply.send({
        id: category.id,
        name: category.name,
        description: category.description,
        cardImageUrl: category.cardImageUrl,
        bannerImageUrl: category.bannerImageUrl,
        numberOfProjects: category.projects.length,
        numberOfServices: category.services.length,
      });
      this.categoryModel.close();
    } catch (error) {
      this.categoryModel.close();
      if (error instanceof z.ZodError)
        reply.code(400).send({ message: "Bad request", errors: error.errors });
      console.error(error, "Category Service Error");
      reply.code(500).send({ message: "Internal server error" });
    }
  }

  async deleteCategory(request: FastifyRequest, reply: FastifyReply) {
    this.categoryModel = new CategoryRepository();
    try {
      const { id: categoryId } = z
        .object({
          id: z.string().nonempty().uuid(),
        })
        .parse(request.params);
      await this.categoryModel.delete(categoryId);

      reply.send({ message: "Category deleted" });
      this.categoryModel.close();
    } catch (error) {
      this.categoryModel.close();
      if (error instanceof z.ZodError)
        reply.code(400).send({ message: "Bad request", errors: error.errors });
      console.error(error, "Category Service Error");
      reply.code(500).send({ message: "Internal server error" });
    }
  }
}

function parseBodyForCreateCategory(request: FastifyRequest) {
  const schema = z.object({
    name: z.string().nonempty().min(3).regex(noSymbolRegex).max(255),
    description: z.string().nonempty().min(3).regex(noSymbolRegex).max(255),
    cardImageUrl: z.string().nonempty().min(3).url(),
    bannerImageUrl: z.string().nonempty().min(3).url(),
  });
  return schema.parse(request.body);
}
