import { FastifyRequest } from "fastify";
import z from "zod";
import BaseParser from "./BaseParser";

export default class AuthenticationParser extends BaseParser {
  parseBodyForAuthentication(request: FastifyRequest) {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });
    return schema.parse(request.body);
  }

  parseAdminPasswordResetBody(request: FastifyRequest) {
    const schema = z.object({
      newPassword: z.string().min(8),
      email: z.string().email(),
    });
    return schema.parse(request.body);
  }

  parseUserPasswordResetBody(request: FastifyRequest) {
    const schema = z.object({
      newPassword: z.string().min(8),
      oldPassword: z.string().min(8),
    });
    return schema.parse(request.body);
  }
}
