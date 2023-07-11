import { HTTP_STATUS_CODE } from "@/constants";
import { hashPassword } from "@/lib/passwordHashing";
import UserParser from "@/parsers/UserParser";
import { AuthRepository } from "@/repository/AuthRepository";
import UserRepository from "@/repository/UserRepository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { handleServiceError } from ".";

export class ProviderService {
  private providerRepository: UserRepository | undefined;
  private authRepository: AuthRepository | undefined;
  private readonly parser = new UserParser();

  async createProvider(request: FastifyRequest, reply: FastifyReply) {
    this.providerRepository = new UserRepository();
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
      const createdClient = await this.providerRepository.createProvier({
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
    this.providerRepository = new UserRepository();
    this.authRepository = new AuthRepository();
    try {
      const { url } = this.parser.parseBodyForImageUpdate(request);
      const { email } = request.user;
      const user = await this.authRepository.getByEmail(email);
      if (!user)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "User not found");
      const { id: userId } = user.User!;
      const updatedProvider =
        await this.providerRepository.updateProviderAvatarImageURL(url, userId);
      const { avatarImageURL } = updatedProvider;
      reply.code(HTTP_STATUS_CODE.OK).send({
        avatarImageURL,
      });
    } catch (error) {
      handleServiceError(error, reply);
    }
  }
}
