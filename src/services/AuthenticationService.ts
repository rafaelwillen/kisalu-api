import { signJWT, verifyJWT } from "@/configs/jwt";
import { HTTP_STATUS_CODE } from "@/constants";
import { comparePasswords, hashPassword } from "@/lib/passwordHashing";
import AuthenticationParser from "@/parsers/AuthenticationParser";
import { AuthRepository } from "@/repository/AuthRepository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import { handleServiceError } from ".";

export default class AuthenticationService {
  private authenticationRepository: AuthRepository | undefined;
  private readonly parser = new AuthenticationParser();

  async authenticateAdministrator(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    this.authenticationRepository = new AuthRepository();
    try {
      const parsedUserBody = this.parser.parseBodyForAuthentication(request);
      const userAuthData = await this.authenticationRepository.getByEmail(
        parsedUserBody.email
      );
      this.authenticationRepository.close();
      if (
        !userAuthData ||
        userAuthData.role !== "Administrator" ||
        !(await comparePasswords(
          parsedUserBody.password,
          userAuthData.password
        ))
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
      const { email, role, createdAt, User } = userAuthData;
      reply.send({
        token,
        user: {
          email: email,
          role,
          createdAt,
          ...omit(User, "id", "loginId", "biography", "birthDate", "gender"),
        },
      });
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
        email,
        ...omit(User, "id", "loginId"),
      });
    } catch (error) {
      handleServiceError(error, [this.authenticationRepository], reply);
    }
  }

  async resetAdministratorPassword(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    this.authenticationRepository = new AuthRepository();
    const mainAdminsEmails = [
      "rafaelpadre@gmail.com",
      "rafael.padre@kisalu.com",
    ];
    try {
      if (!mainAdminsEmails.includes(request.user.email))
        throw new HTTPError(
          HTTP_STATUS_CODE.FORBIDDEN,
          "You are not allowed to perform this action"
        );
      const { newPassword, email } =
        this.parser.parsePasswordResetBody(request);
      const userAuthData = await this.authenticationRepository.getByEmail(
        email
      );
      if (!userAuthData || userAuthData.role !== "Administrator")
        throw new HTTPError(
          HTTP_STATUS_CODE.NOT_FOUND,
          "Administrator not found"
        );
      const hashedPassword = await hashPassword(newPassword);
      await this.authenticationRepository.updateAdminPassword(
        email,
        hashedPassword
      );
      this.authenticationRepository.close();
      return reply.send();
    } catch (error) {
      handleServiceError(error, [this.authenticationRepository], reply);
    }
  }

  async authenticateUser(request: FastifyRequest, reply: FastifyReply) {
    this.authenticationRepository = new AuthRepository();
    try {
      const parsedUserBody = this.parser.parseBodyForAuthentication(request);
      const userAuthData = await this.authenticationRepository.getByEmail(
        parsedUserBody.email
      );
      this.authenticationRepository.close();
      if (
        !userAuthData ||
        userAuthData.role === "Administrator" ||
        !(await comparePasswords(
          parsedUserBody.password,
          userAuthData.password
        ))
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
      const { email, role, createdAt, User } = userAuthData;
      reply.send({
        token,
        user: {
          email,
          role,
          createdAt,
          ...omit(User, "id", "loginId", "biography", "birthDate", "gender"),
        },
      });
    } catch (error) {
      handleServiceError(error, [this.authenticationRepository], reply);
    }
  }
}
