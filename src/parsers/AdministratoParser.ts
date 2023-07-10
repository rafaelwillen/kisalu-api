import { noSymbolRegex } from "@/utils/regex";
import { FastifyRequest } from "fastify";
import z from "zod";
import BaseParser from "./BaseParser";

export default class AdministratorParser extends BaseParser {
  parseCreationFromBody(request: FastifyRequest) {
    const schema = z.object({
      firstName: z.string().min(3).regex(noSymbolRegex, "No symbols allowed"),
      lastName: z.string().min(3).regex(noSymbolRegex, "No symbols allowed"),
      avatarImageURL: z.string().url(),
      gender: z.enum(["Male", "Female"]),
      email: z.string().email(),
      password: z.string().min(8).max(20),
    });
    return schema.parse(request.body);
  }

  parseUpdateFromBody(request: FastifyRequest) {
    const schema = z.object({
      firstName: z
        .string()
        .min(3)
        .regex(noSymbolRegex, "No symbols allowed")
        .optional(),
      lastName: z
        .string()
        .min(3)
        .regex(noSymbolRegex, "No symbols allowed")
        .optional(),
      avatarImageURL: z.string().url().optional(),
      gender: z.enum(["Male", "Female"]).optional(),
    });
    return schema.parse(request.body);
  }

  parseDeletionFromBody(request: FastifyRequest) {
    const schema = z.object({
      email: z.string().email(),
    });
    return schema.parse(request.body);
  }
}
