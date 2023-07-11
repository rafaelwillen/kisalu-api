import { HTTP_STATUS_CODE } from "@/constants";
import { hashPassword } from "@/lib/passwordHashing";
import UserParser from "@/parsers/UserParser";
import { ClientRepository } from "@/repository/ClientRepostory";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { handleServiceError } from ".";

export class ClientService {
  private clientRepository = new ClientRepository();
  private readonly parser = new UserParser();

  async createClient(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { password, email, phoneNumber, ...userData } =
        this.parser.parseBodyForUserCreation(request);
      const userWithEmail = await this.clientRepository.getByEmail(email);
      if (userWithEmail)
        throw new HTTPError(
          HTTP_STATUS_CODE.CONFLICT,
          "An user with this email already exists"
        );
      const userWithPhoneNumber = await this.clientRepository.getByPhoneNumber(
        phoneNumber
      );
      if (userWithPhoneNumber)
        throw new HTTPError(
          HTTP_STATUS_CODE.CONFLICT,
          "An user with this phone number already exists"
        );
      const hashedPassword = await hashPassword(password);
      const createdClient = await this.clientRepository.createClient({
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
}
