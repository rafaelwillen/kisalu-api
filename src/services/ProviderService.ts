import { HTTP_STATUS_CODE } from "@/constants";
import { hashPassword } from "@/lib/passwordHashing";
import { ProviderRepository } from "@/repository/ProviderRepository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { handleServiceError } from ".";
import UserService from "./UserService";

export class ProviderService extends UserService {
  private providerRepository = new ProviderRepository();

  async createProvider(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { password, email, phoneNumber, ...userData } =
        this.parser.parseBodyForUserCreation(request);
      const userWithEmail = await this.providerRepository.getByEmail(email);
      if (userWithEmail)
        throw new HTTPError(
          HTTP_STATUS_CODE.CONFLICT,
          "An user with this email already exists"
        );
      const userWithPhoneNumber =
        await this.providerRepository.getByPhoneNumber(phoneNumber);
      if (userWithPhoneNumber)
        throw new HTTPError(
          HTTP_STATUS_CODE.CONFLICT,
          "An user with this phone number already exists"
        );
      const hashedPassword = await hashPassword(password);
      const createdClient = await this.providerRepository.createProvider({
        auth: {
          email,
          password: hashedPassword,
          phoneNumber,
        },
        ...userData,
      });
      const { loginId, ...created } = createdClient;
      reply.code(HTTP_STATUS_CODE.CREATED).send(created);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getProviderRatings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: providerId } = this.parser.parseIdFromParams(request);
      const provider = await this.providerRepository.getProviderById(
        providerId
      );
      if (!provider)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Provider not found");
      return reply.send({
        firstName: provider.firstName,
        lastName: provider.lastName,
        reviews: provider.reviews,
      });
    } catch (error) {
      handleServiceError(error, reply);
    }
  }
}
