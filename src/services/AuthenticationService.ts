import { AdministratorRepository } from "@/repository";
import { serialize } from "cookie";
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

      const token = await reply.jwtSign(
        {
          username: user.username,
          id: user.id,
          email: user.email,
          name: user.name,
        },
        {
          sign: {
            expiresIn: "1h",
          },
        }
      );

      const serializedCookie = serialize("token", `Bearer ${token}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60, //1h
      });
      reply
        .headers({
          "Set-Cookie": serializedCookie,
        })
        .send({ token });
    } catch (error) {
      this.administratorRepository.close();
      if (error instanceof z.ZodError)
        reply.code(400).send({ message: "Bad request", errors: error.errors });
      console.error(error, "Authentication Service Error");
      reply.code(500).send({ message: "Internal server error" });
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
