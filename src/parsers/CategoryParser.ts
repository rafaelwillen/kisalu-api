import { FastifyRequest } from "fastify";
import z from "zod";
import BaseParser from "./BaseParser";

export default class CategoryParser extends BaseParser {
  parseBodyForCreation(request: FastifyRequest) {
    const schema = z.object({
      name: z.string().nonempty().min(3).max(255),
      mainImageURL: z.string().url(),
      bannerImageURL: z.string().url(),
      description: z.string().nonempty().min(3).max(255),
    });
    return schema.parse(request.body);
  }

  parseSlugFromParams(request: FastifyRequest) {
    const schema = z.object({
      slug: z.string().nonempty().min(3).max(255),
    });
    return schema.parse(request.params);
  }

  parseSearchQuery(request: FastifyRequest) {
    const schema = z.object({
      name: z.string().nonempty().min(3).max(255),
    });
    return schema.parse(request.query);
  }
}
