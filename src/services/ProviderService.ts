import { HTTP_STATUS_CODE } from "@/constants";
import { hashPassword } from "@/lib/passwordHashing";
import UserParser from "@/parsers/UserParser";
import { ProviderRepository } from "@/repository/ProviderRepository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { handleServiceError } from ".";

export class ProviderService {
  private providerRepository = new ProviderRepository();
  private readonly parser = new UserParser();

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

  async updateProviderAvatarImage(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { url } = this.parser.parseBodyForImageUpdate(request);
      const { email } = request.user;
      const user = await this.providerRepository.getByEmail(email);
      if (!user)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "User not found");
      const updatedProvider =
        await this.providerRepository.updateUserAvatarImageURL(url, user.id);
      const { avatarImageURL } = updatedProvider;
      reply.code(HTTP_STATUS_CODE.OK).send({
        avatarImageURL,
      });
    } catch (error) {
      handleServiceError(error, reply);
    }
  }
}
