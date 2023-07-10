import { FastifyRequest } from "fastify";
import z from "zod";

export default abstract class BaseParser {
  parseIdFromParams(request: FastifyRequest) {
    const schema = z.object({
      id: z.string().uuid(),
    });
    return schema.parse(request.params);
  }
}
