import { FastifyRequest } from "fastify";
import z from "zod";
import BaseParser from "./BaseParser";

export default class ServiceParser extends BaseParser {
  parseBodyForCreation(request: FastifyRequest) {
    const bodySchema = z.object({
      title: z.string().min(3),
      description: z.string().min(3),
      bannerImageURL: z.string().url().optional(),
      deliveryTime: z.string(),
      featuredImagesURL: z.array(z.string().url()).optional().default([]),
      minimumPrice: z.number().int().min(0),
      isHighlighted: z.boolean(),
      categoryName: z.string().min(3).max(255),
    });
    const parsedBody = bodySchema.parse(request.body);
    return parsedBody;
  }
}
