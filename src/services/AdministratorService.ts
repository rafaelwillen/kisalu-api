import { AdministratorRepository } from "@/repository";
import { noSymbolRegex } from "@/utils/regex";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import z from "zod";

export default class AdministratorService {
  private administratorRepository: AdministratorRepository | undefined;

  async createAdministrator(request: FastifyRequest, reply: FastifyReply) {
    this.administratorRepository = new AdministratorRepository();
    try {
      const adminBody = parseAdminCreationBody(request);
      const admin = await this.administratorRepository.create({
        ...adminBody,
      });
      this.administratorRepository.close();
      reply.code(201).send(omit(admin, "password"));
    } catch (error) {
      this.administratorRepository.close();
      if (error instanceof z.ZodError)
        reply.code(400).send({ message: "Bad request", errors: error.errors });
      console.error(error, "Category Service Error");
      reply.code(500).send({ message: "Internal server error" });
    }
  }
}

function parseAdminCreationBody(request: FastifyRequest) {
  const schema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(8).max(20),
    name: z.string().min(3).max(20).regex(noSymbolRegex, "No symbols allowed"),
  });
  return schema.parse(request.body);
}
