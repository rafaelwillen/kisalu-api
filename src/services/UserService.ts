import { HTTP_STATUS_CODE } from "@/constants";
import UserParser from "@/parsers/UserParser";
import AddressRepository from "@/repository/AddressRepository";
import UserRepository from "@/repository/UserRepository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { handleServiceError } from ".";

export default abstract class UserService {
  private userRepository = new UserRepository();
  protected readonly parser = new UserParser();

  async updateUserAvatarImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { url } = this.parser.parseBodyForImageUpdate(request);
      const { email } = request.user;
      const user = await this.userRepository.getByEmail(email);
      if (!user)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "User not found");
      const { avatarImageURL } =
        await this.userRepository.updateUserAvatarImageURL(url, user.id);
      reply.code(HTTP_STATUS_CODE.OK).send({
        avatarImageURL,
      });
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async updateUserAddress(request: FastifyRequest, reply: FastifyReply) {
    try {
      const address = this.parser.parseBodyForAddressUpdate(request);
      const { email } = request.user;
      const user = await this.userRepository.getByEmail(email);
      if (!user)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "User not found");
      if (!user.address) {
        const updatedUserWithAddress = this.userRepository.addAddress(
          user.id,
          address
        );
        reply.code(HTTP_STATUS_CODE.OK).send(updatedUserWithAddress);
      } else {
        const addressRepository = new AddressRepository();
        const updatedAddress = addressRepository.update({
          id: user.address.id,
          ...address,
        });
        return updatedAddress;
      }
    } catch (error) {
      handleServiceError(error, reply);
    }
  }
}
