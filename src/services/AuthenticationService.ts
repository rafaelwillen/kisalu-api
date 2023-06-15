import { signJWT, verifyJWT } from "@/configs/jwt";
import { HTTP_STATUS_CODE } from "@/constants";
import { AuthRepository } from "@/repository/AuthRepository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import z from "zod";
import { handleServiceError } from ".";

export default class AuthenticationService {
  private authenticationRepository: AuthRepository | undefined;

  async authenticateAdministrator(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    this.authenticationRepository = new AuthRepository();
    try {
      this.authenticationRepository = new AuthRepository();
      const parsedUserBody = parseBodyForAuthentication(request);
      const userAuthData = await this.authenticationRepository.getByEmail(
        parsedUserBody.email
      );
      this.authenticationRepository.close();
      // TODO: Add password hashing
      if (
        !userAuthData ||
        userAuthData.role !== "Administrator" ||
        userAuthData.password !== parsedUserBody.password
      ) {
        throw new HTTPError(
          HTTP_STATUS_CODE.UNAUTHORIZED,
          "Invalid credentials"
        );
      }
      const token = await signJWT(reply, {
        email: userAuthData.email,
        role: userAuthData.role,
      });
      reply.send({ token });
    } catch (error) {
      handleServiceError(error, [this.authenticationRepository], reply);
    }
  }

  async getCurrentAuthenticatedUser(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    this.authenticationRepository = new AuthRepository();
    try {
      const { email } = await verifyJWT(request);
      const authData = await this.authenticationRepository.getByEmail(email);
      if (!authData)
        throw new HTTPError(
          HTTP_STATUS_CODE.UNAUTHORIZED,
          "Invalid credentials"
        );
      this.authenticationRepository.close();
      const { User, isActive, phoneNumber, role, updatedAt, createdAt } =
        authData;

      reply.send({
        isActive: isActive ?? true,
        phoneNumber,
        role,
        updatedAt,
        createdAt,
        ...omit(User, "id", "loginId"),
      });
    } catch (error) {
      handleServiceError(error, [this.authenticationRepository], reply);
    }
  }
}

function parseBodyForAuthentication(request: FastifyRequest) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });
  return schema.parse(request.body);
}
