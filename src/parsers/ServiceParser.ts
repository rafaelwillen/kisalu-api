import { FastifyRequest } from "fastify";
import z from "zod";
import BaseParser from "./BaseParser";

export default class ServiceParser extends BaseParser {
  parseBodyForCreation(request: FastifyRequest) {
    const bodySchema = z.object({
      title: z.string().min(3),
      description: z.string().min(3),
      bannerImageURL: z.string().url().optional(),
      featuredImagesURL: z.array(z.string().url()).optional().default([]),
      minimumPrice: z.number().int().min(0),
      isHighlighted: z.boolean().optional().default(false),
      categoryName: z.string().min(3).max(255),
    });
    const parsedBody = bodySchema.parse(request.body);
    return parsedBody;
  }
}
