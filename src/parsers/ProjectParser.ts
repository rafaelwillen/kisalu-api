import { FastifyRequest } from "fastify";
import z from "zod";
import BaseParser from "./BaseParser";

export default class ProjectParser extends BaseParser {
  parseBodyForCreation(request: FastifyRequest) {
    const bodySchema = z
      .object({
        title: z.string().min(3),
        description: z.string().min(3),
        bannerImageURL: z.string().url().optional(),
        featuredImagesURL: z.array(z.string().url()).optional(),
        minimumPrice: z.number().int().min(0),
        maximumPrice: z.number().int().min(0),
        categoryName: z.string().min(3).max(255),
      })
      .refine(
        ({ minimumPrice, maximumPrice }) => minimumPrice <= maximumPrice,
        {
          message: "Minimum price must be less than or equal to maximum price",
          path: ["minimumPrice", "maximumPrice"],
        }
      );
    const parsedBody = bodySchema.parse(request.body);
    return parsedBody;
  }
}
