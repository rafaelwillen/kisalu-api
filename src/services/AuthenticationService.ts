import { AdministratorRepository } from "@/repository";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export default class AuthenticationService {
  private administratorRepository: AdministratorRepository | undefined;

  async adminLogin(request: FastifyRequest, reply: FastifyReply) {
    this.administratorRepository = new AdministratorRepository();
    try {
      const loginBody = parseAdminBodyForLogin(request);
      const user = await this.administratorRepository.getByUsername(
        loginBody.username
      );
      if (!user) {
        this.administratorRepository.close();
        reply.code(401).send({ message: "Invalid credentials" });
        return;
      }

      // TODO: Add password hashing
      if (user.password !== loginBody.password) {
        this.administratorRepository.close();
        reply.code(401).send({ message: "Invalid credentials" });
        return;
      }
      this.administratorRepository.close();

      const token = await reply.jwtSign(
        {
          username: user.username,
          email: user.email,
          role: "admin",
        },
        {
          sign: {
            expiresIn: "1h",
          },
        }
      );
      reply.send({ token });
    } catch (error) {
      this.administratorRepository.close();
      if (error instanceof z.ZodError)
        reply.code(400).send({ message: "Bad request", errors: error.errors });
      console.error(error, "Authentication Service Error");
      reply.code(500).send({ message: "Internal server error" });
    }
  }

  async verifyAdminToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const payload = await request.jwtVerify();
      const parsedPayload = parseJWTPayloadType(payload);
      if (parsedPayload.role !== "admin") throw new Error("Unauthorized");
      reply.send({ message: "Authorized", payload: parsedPayload });
    } catch (error) {
      reply.code(401).send({ message: "Unauthorized" });
    }
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const payload = await request.jwtVerify();
      const { email, role } = parseJWTPayloadType(payload);
      if (role === "admin") {
        this.administratorRepository = new AdministratorRepository();
        const user = await this.administratorRepository.getByEmail(email);
        this.administratorRepository.close();
        if (!user) {
          reply.code(401).send({ message: "Unauthorized" });
          return;
        }
        const { password, loginToken, ...userWithoutSecrets } = user;
        reply.send({ ...userWithoutSecrets });
      } else {
        // TODO: Do something for user
      }
    } catch (error) {
      reply.code(401).send({ message: "Unauthorized" });
    }
  }
}

function parseAdminBodyForLogin(request: FastifyRequest) {
  const schema = z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty(),
  });
  return schema.parse(request.body);
}

function parseJWTPayloadType(payload: any) {
  const schema = z.object({
    username: z.string().nonempty(),
    email: z.string().nonempty().email(),
    role: z.enum(["admin", "user"]),
    exp: z.number().int().positive(),
    iat: z.number().int().positive(),
  });
  return schema.parse(payload);
}