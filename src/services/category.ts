import { CategoryModel } from "@/models";
import { noSymbolRegex } from "@/utils/regex";
import { FastifyReply, FastifyRequest } from "fastify";
import underscore from "underscore";
import { z } from "zod";

export default class CategoryService {
  private categoryModel: CategoryModel | undefined;

  async createCategory(request: FastifyRequest, reply: FastifyReply) {
    this.categoryModel = new CategoryModel();
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
        reply.code(400).send({ message: "Bad request", errors: error.message });
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
